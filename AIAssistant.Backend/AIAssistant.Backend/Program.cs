using System.Text;
using System.Text.Json.Serialization;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using AIAssistant.Backend;

// ۱. تنظیم انکودینگ برای پشتیبانی کامل از کاراکترهای فارسی در کنسول و پایپ‌لاین
Console.OutputEncoding = Encoding.UTF8;
Console.InputEncoding = Encoding.UTF8;

var builder = WebApplication.CreateBuilder(args);

// ۲. پیکربندی CORS برای اتصال کلاینت Vite/React
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ۳. ثبت سرویس RAG اختصاصی نفت (تک‌نمونه / Singleton)
builder.Services.AddSingleton<IPetroleumRagService, PetroleumRagService>();

// ۴. اتصال به Ollama با شناسه دقیق مدل نصب‌شده (llama3-fa:latest)
builder.Services.AddSingleton(sp =>
{
    var kernelBuilder = Kernel.CreateBuilder();
    kernelBuilder.AddOpenAIChatCompletion(
        modelId: "llama3-fa:latest",
        apiKey: "secret-rnd-core",
        endpoint: new Uri("http://localhost:11434/v1")
    );
    return kernelBuilder.Build();
});

var app = builder.Build();

// ۵. مقداردهی اولیه و بارگیری چانک‌های متنی RAG هنگام روشن شدن سرور
using (var scope = app.Services.CreateScope())
{
    var ragService = scope.ServiceProvider.GetRequiredService<IPetroleumRagService>();
    await ragService.InitializeAsync();
}

app.UseCors("FrontendPolicy");

// ۶. پرامپت‌های پایه‌ای نقش‌های مهندسی
var assistantPrompts = new Dictionary<string, string>
{
    ["petroleum"] = """
        شما یک مهندس ارشد و مشاور بین‌المللی مهندسی نفت، گاز و پتروشیمی هستید.
        - تخصص شما: مهندسی مخازن، شبیه‌سازی جریان چندفازی، مکانیک سیالات حفاری، تاسیسات سرچاهی، فرآیندهای پالایش و سیستم‌های پایپینگ تحت فشار است.
        - پاسخ‌ها باید علمی، مستند به استانداردهای مرجع API (مانند API Spec 6A, API 570, API 1104) و استانداردهای ASME/ASTM و با ذکر روابط فنی ارائه شوند.
        """,
    ["structural"] = """
        شما یک مهندس ارشد محاسب سازه و مکانیک محیط‌های پیوسته هستید.
        - تخصص شما: تحلیل خطی و غیرخطی FEM، طراحی سیستم‌های باربر جانبی، تحلیل لرزه‌ای، بار باد، دینامیک خاک و پی است.
        - استناد به آیین‌نامه‌های معتبر مانند AISC 360/341، ACI 318، ASCE 7 و مقررات ملی ساختمان در اولویت تحلیل‌های شماست.
        """,
    ["metallurgy"] = """
        شما یک متخصص ارشد مهندسی متالورژی و علم مواد هستید.
        - تخصص شما: انتخاب گریدهای آلیاژی، تحلیل دیاگرام‌های TTT/CCT، چرخه‌های عملیات حرارتی، مکانیزم‌های شکست (Creep, Fatigue)، سایش و متالورژی جوش است.
        - محاسبات و پیشنهادها را با استانداردهای دقیق DIN، AISI و ASTM مستند کنید.
        """,
    ["manufacturing"] = """
        شما یک مهندس ارشد ساخت، تولید و اتوماسیون خطوط تولید صنعتی هستید.
        - تخصص شما: فرآیندهای براده‌برداری پیشرفته CNC، شکل‌دهی فلزات، ریخته‌گری دقیق، استانداردهای جوشکاری (AWS D1.1)، متدولوژی DFM/DFA و SPC است.
        - پاسخ‌ها باید شامل الزامات اجرایی کارگاهی، انتخاب ابزار و پارامترهای فنی دقیق باشد.
        """
};

// ۷. تنظیمات قفل دمای مدل برای دقت بالای محاسبات مهندسی و ممانعت از هذیان
var executionSettings = new PromptExecutionSettings
{
    ExtensionData = new Dictionary<string, object>
    {
        { "temperature", 0.05 },
        { "top_p", 0.85 },
        { "repeat_penalty", 1.2 }
    }
};

// ۸. اندپوینت استریم چت با تلفیق RAG
app.MapPost("/api/chat", async (ChatRequest request, Kernel kernel, IPetroleumRagService ragService, HttpResponse response, HttpContext httpContext) =>
{
    var ct = httpContext.RequestAborted;

    if (request?.Messages == null || request.Messages.Count == 0)
    {
        response.StatusCode = StatusCodes.Status400BadRequest;
        await response.WriteAsync("پیامی ارسال نشده است.", ct);
        return;
    }

    var chatService = kernel.GetRequiredService<IChatCompletionService>();
    var history = new ChatHistory();

    string roleKey = (request.Role ?? string.Empty).ToLower().Trim();
    string systemPrompt = assistantPrompts.GetValueOrDefault(
        roleKey,
        "شما یک دستیار هوشمند و ارشد در تیم مهندسی صنایع سنگین هستید."
    );

    // آخرین پیام کاربر برای بازیابی RAG
    var lastUserMsg = request.Messages.LastOrDefault(m => m.Role.Equals("user", StringComparison.OrdinalIgnoreCase));

    // در صورتی که نقش Petroleum باشد، داده‌های مرجع استخراج و الصاق می‌شوند
    if (roleKey == "petroleum" && lastUserMsg != null)
    {
        var matchedDocs = ragService.Search(lastUserMsg.Text, topK: 3);
        if (matchedDocs.Any())
        {
            var contextText = string.Join("\n---\n", matchedDocs.Select(d =>
                $"[Source File: {d.Source}]\nHeader/Topic: {d.Topic}\nTechnical Specification:\n{d.Content}"));

            systemPrompt += $"\n\n[مستندات فنی و مهندسی سرچاهی تأیید‌شده]:\n{contextText}\n\nدستور اکید: پاسخ خود را دقیقاً با استناد به مقادیر و کدهای موجود در مستندات بالا ارائه بده.";

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"[RAG Injected] {matchedDocs.Count} chunks injected for query: {lastUserMsg.Text}");
            Console.ResetColor();
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"[RAG Warning] No matching context found for: {lastUserMsg.Text}");
            Console.ResetColor();
        }
    }

    history.AddSystemMessage(systemPrompt);

    // افزودن تاریخچه تعامل کلاینت
    foreach (var msg in request.Messages.TakeLast(6))
    {
        if (msg.Role.Equals("user", StringComparison.OrdinalIgnoreCase))
            history.AddUserMessage(msg.Text);
        else if (msg.Role.Equals("assistant", StringComparison.OrdinalIgnoreCase))
            history.AddAssistantMessage(msg.Text);
    }

    response.ContentType = "text/plain; charset=utf-8";

    try
    {
        await foreach (var chunk in chatService.GetStreamingChatMessageContentsAsync(history, executionSettings, kernel, ct))
        {
            if (chunk.Content != null)
            {
                var bytes = Encoding.UTF8.GetBytes(chunk.Content);
                await response.Body.WriteAsync(bytes, ct);
                await response.Body.FlushAsync(ct);
            }
        }
    }
    catch (OperationCanceledException)
    {
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("[Chat Stream] Client canceled request.");
        Console.ResetColor();
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"[Ollama/Runtime Error] {ex.GetType().Name}: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"[Details]: {ex.InnerException.Message}");
        }
        Console.ResetColor();

        if (!response.HasStarted)
        {
            response.StatusCode = StatusCodes.Status500InternalServerError;
            await response.WriteAsync($"خطای سرور در ارتباط با مدل: {ex.Message}", ct);
        }
    }
});

// اندپوینت بررسی سلامت سرور
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    model = "llama3-fa:latest",
    port = 5060,
    timestamp = DateTime.UtcNow
}));

app.Run("http://localhost:5060");

public record ChatMessageItem(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("text")] string Text
);

public record ChatRequest(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("messages")] List<ChatMessageItem> Messages
);
