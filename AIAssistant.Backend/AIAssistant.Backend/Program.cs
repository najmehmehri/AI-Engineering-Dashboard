using System.Text;
using System.Text.Json.Serialization;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using AIAssistant.Backend; // فضای نام سرویس RAG

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ثبت سرویس RAG به صورت تک‌نمونه (Singleton)
builder.Services.AddSingleton<IPetroleumRagService, PetroleumRagService>();

builder.Services.AddSingleton(sp =>
{
    var kernelBuilder = Kernel.CreateBuilder();
    kernelBuilder.AddOpenAIChatCompletion(
        modelId: "llama3.2:3b",
        apiKey: "ollama-local",
        endpoint: new Uri("http://localhost:11434/v1")
    );
    return kernelBuilder.Build();
});

var app = builder.Build();

// ایندکس کردن داده‌های دیتابیس مهندسی نفت به محض روشن شدن سرور
using (var scope = app.Services.CreateScope())
{
    var ragService = scope.ServiceProvider.GetRequiredService<IPetroleumRagService>();
    await ragService.InitializeAsync();
}

app.UseCors("FrontendPolicy");

var assistantPrompts = new Dictionary<string, string>
{
    ["petroleum"] = """
        شما یک مهندس ارشد و مشاور بین‌المللی مهندسی نفت، گاز و پتروشیمی هستید.
        - تخصص شما: مهندسی مخازن، شبیه‌سازی جریان چندفازی، مکانیک سیالات حفاری، تاسیسات سرچاهی، فرآیندهای پالایش و سیستم‌های پایپینگ تحت فشار است.
        - پاسخ‌ها باید علمی، مستند به استانداردهای مرجع API (مانند API 520, API 650, API 1104) و استانداردهای ASME/ASTM و با ذکر روابط فنی ارائه شوند.
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

app.MapPost("/api/chat", async (ChatRequest request, Kernel kernel, IPetroleumRagService ragService, HttpResponse response, CancellationToken ct) =>
{
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

    // آخرین پیام کاربر را استخراج می‌کنیم
    var lastUserMsg = request.Messages.LastOrDefault(m => m.Role.Equals("user", StringComparison.OrdinalIgnoreCase));

    // در صورتی که نقش Petroleum باشد، RAG مستندات مرتبط را استخراج می‌کند
    if (roleKey == "petroleum" && lastUserMsg != null)
    {
        var matchedDocs = ragService.Search(lastUserMsg.Text, topK: 3);
        if (matchedDocs.Any())
        {
            var contextText = string.Join("\n---\n", matchedDocs.Select(d =>
                $"[Source: {d.Source}]\nQuestion/Topic: {d.Question}\nReference Data: {d.Answer}"));

            systemPrompt += $"\n\nاز مستندات فنی و تایید‌شده زیر برای پاسخ به کاربر استفاده کن و در صورت تطابق، به آن‌ها استناد کن:\n--- CONTEXT START ---\n{contextText}\n--- CONTEXT END ---";
        }
    }

    history.AddSystemMessage(systemPrompt);

    // افزودن تاریخچه مکالمه
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
        await foreach (var chunk in chatService.GetStreamingChatMessageContentsAsync(history, cancellationToken: ct))
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
        // لغو استریم توسط کلاینت
    }
});

app.Run("http://localhost:5060");

public record ChatMessageItem(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("text")] string Text
);

public record ChatRequest(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("messages")] List<ChatMessageItem> Messages
);
