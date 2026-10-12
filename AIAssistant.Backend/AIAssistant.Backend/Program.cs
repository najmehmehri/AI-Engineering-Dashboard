using System.Text;
using System.Text.Json.Serialization;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

var builder = WebApplication.CreateBuilder(args);

// ۱. فعال‌سازی CORS برای ارتباط با فرانت‌اند
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ۲. راه‌اندازی موتور هوش مصنوعی Semantic Kernel متصل به Ollama
builder.Services.AddSingleton(sp =>
{
    var kernelBuilder = Kernel.CreateBuilder();
    kernelBuilder.AddOpenAIChatCompletion(
        modelId: "llama3.2:3b",
        apiKey: "*******",
        endpoint: new Uri("http://localhost:11434/v1")
    );
    return kernelBuilder.Build();
});

var app = builder.Build();
app.UseCors();

// ۳. تعریف هویت دستیاران تخصصی مهندسی صنایع سنگین
var assistantPrompts = new Dictionary<string, string>
{
    {
        "petroleum",
        """
        شما یک مهندس ارشد و مشاور بین‌المللی مهندسی نفت، گاز و پتروشیمی هستید.
        - تخصص شما: مهندسی مخازن، شبیه‌سازی جریان چندفازی، مکانیک سیالات حفاری، تاسیسات سرچاهی، فرآیندهای پالایش و سیستم‌های پایپینگ تحت فشار است.
        - در پاسخ‌ها به استانداردهای مرجع API (نظیر API 520, API 650, API 1104) و استانداردهای ASME/ASTM استناد فرمایید.
        """
    },
    {
        "structural",
        """
        شما یک مهندس ارشد محاسب سازه و مکانیک محیط‌های پیوسته هستید.
        - تخصص شما: تحلیل خطی و غیرخطی المان محدود (FEM)، طراحی سیستم‌های باربر جانبی (قاب‌های مهاربندی، دیوارهای برشی)، تحلیل لرزه‌ای، بار باد، دینامیک خاک و پی است.
        - استناد به آیین‌نامه‌های معتبر مانند AISC 360/341، ACI 318، ASCE 7 و مقررات ملی ساختمان در اولویت تحلیل‌های شماست.
        """
    },
    {
        "metallurgy",
        """
        شما یک متخصص ارشد مهندسی متالورژی و علم مواد هستید.
        - تخصص شما: انتخاب گریدهای آلیاژی (فولادهای زنگ‌نزن، ابزار، سوپرآلیاژهای پایه نیکل، اینکونل، تیتانیوم)، تحلیل نمودارهای تعادلی TTT/CCT، چرخه‌های عملیات حرارتی، مکانیزم‌های شکست (Creep, Fatigue)، سایش و متالورژی جوش است.
        - محاسبات و پیشنهادها را با استانداردهای دقیق DIN، AISI و ASTM مستند کنید.
        """
    },
    {
        "manufacturing",
        """
        شما یک مهندس ارشد ساخت، تولید و اتوماسیون خطوط تولید صنعتی هستید.
        - تخصص شما: فرآیندهای براده‌برداری پیشرفته CNC (مسیر ابزار، سرعت برشی، نرخ پیشروی)، فرآیندهای شکل‌دهی فلزات، ریخته‌گری دقیق، استانداردهای بازرسی جوشکاری (AWS D1.1)، متدولوژی DFM/DFA و کنترل کیفیت آماری (SPC) است.
        - پاسخ‌ها باید شامل الزامات اجرایی کارگاهی، انتخاب ابزار و پارامترهای فنی دقیق باشد.
        """
    }
};

// ۴. مسیر دریافت پیام و چت استریمینگ
app.MapPost("/api/chat", async (ChatRequest request, Kernel kernel, HttpResponse response) =>
{
    if (request == null || string.IsNullOrWhiteSpace(request.Message))
    {
        response.StatusCode = StatusCodes.Status400BadRequest;
        await response.WriteAsync("Message cannot be empty.");
        return;
    }

    var chatService = kernel.GetRequiredService<IChatCompletionService>();
    var history = new ChatHistory();

    // استخراج کلید تخصص انتخاب‌شده
    string roleKey = (request.Role ?? request.AssistantId ?? string.Empty).ToLower().Trim();

    string systemPrompt = assistantPrompts.GetValueOrDefault(
        roleKey,
        "شما یک دستیار هوشمند، فنی و ارشد در تیم مهندسی صنایع سنگین (نفت، سازه، متالورژی، ساخت و تولید) هستید."
    );

    history.AddSystemMessage(systemPrompt);
    history.AddUserMessage(request.Message);

    response.ContentType = "text/plain; charset=utf-8";

    // ارسال پاسخ زنده (Streaming) به فرانت‌اند
    await foreach (var chunk in chatService.GetStreamingChatMessageContentsAsync(history))
    {
        if (chunk.Content != null)
        {
            var bytes = Encoding.UTF8.GetBytes(chunk.Content);
            await response.Body.WriteAsync(bytes);
            await response.Body.FlushAsync();
        }
    }
});

// ۵. اجرا روی پورت ۵۰۶۰ (مستقل از پورت ۵۰۵۵ پروژه اول)
app.Run("http://localhost:5060");

// مدل ورودی درخواست
public record ChatRequest(
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("assistantId")] string? AssistantId = null,
    [property: JsonPropertyName("role")] string? Role = null
);
