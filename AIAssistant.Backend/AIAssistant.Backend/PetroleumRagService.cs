using System.Text.Json;
using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;

namespace AIAssistant.Backend
{
    public record KnowledgeItem(string Source, string Question, string Answer);

    public interface IPetroleumRagService
    {
        Task InitializeAsync();
        List<KnowledgeItem> Search(string query, int topK = 3);
    }

    public class PetroleumRagService : IPetroleumRagService
    {
        private readonly List<KnowledgeItem> _knowledgeStore = new();
        private readonly string _knowledgeBasePath;
        private bool _isInitialized = false;
        private readonly ILogger<PetroleumRagService> _logger;

        public PetroleumRagService(IWebHostEnvironment env, ILogger<PetroleumRagService> logger)
        {
            _logger = logger;
            // مسیر پوشه KnowledgeBase بر اساس روت پروژه
            _knowledgeBasePath = Path.Combine(env.ContentRootPath, "KnowledgeBase");
        }

        public async Task InitializeAsync()
        {
            if (_isInitialized) return;

            if (!Directory.Exists(_knowledgeBasePath))
            {
                _logger.LogWarning($"KnowledgeBase directory not found at: {_knowledgeBasePath}");
                return;
            }

            _logger.LogInformation("Indexing Petroleum Knowledge Base files...");

            // 1. بارگیری داده‌های JSON (SPE MCQ)
            var jsonPath = Path.Combine(_knowledgeBasePath, "formationeval_spe_mcq_v0.3.json");
            if (File.Exists(jsonPath))
            {
                try
                {
                    var jsonContent = await File.ReadAllTextAsync(jsonPath);
                    using var doc = JsonDocument.Parse(jsonContent);

                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var el in doc.RootElement.EnumerateArray())
                        {
                            var q = el.TryGetProperty("question", out var qProp) ? qProp.GetString() : "";
                            var a = el.TryGetProperty("answer", out var aProp) ? aProp.GetString() :
                                   (el.TryGetProperty("explanation", out var expProp) ? expProp.GetString() : "");

                            if (!string.IsNullOrWhiteSpace(q))
                            {
                                _knowledgeStore.Add(new KnowledgeItem("SPE_MCQ", q, a ?? ""));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error reading SPE MCQ JSON");
                }
            }

            // 2. بارگیری CSV های FORCE و GeoGPT
            var csvFiles = Directory.GetFiles(_knowledgeBasePath, "*.csv");
            var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                MissingFieldFound = null,
                HeaderValidated = null,
                BadDataFound = null
            };

            foreach (var file in csvFiles)
            {
                try
                {
                    var fileName = Path.GetFileName(file);
                    using var reader = new StreamReader(file);
                    using var csv = new CsvReader(reader, csvConfig);

                    var records = csv.GetRecords<dynamic>();
                    foreach (var row in records)
                    {
                        var dict = (IDictionary<string, object>)row;

                        // شناسایی داینامیک ستون‌های سوال و جواب
                        string question = dict.FirstOrDefault(k => k.Key.Contains("question", StringComparison.OrdinalIgnoreCase) || k.Key.Contains("prompt", StringComparison.OrdinalIgnoreCase)).Value?.ToString() ?? "";
                        string answer = dict.FirstOrDefault(k => k.Key.Contains("answer", StringComparison.OrdinalIgnoreCase) || k.Key.Contains("response", StringComparison.OrdinalIgnoreCase)).Value?.ToString() ?? "";

                        if (!string.IsNullOrWhiteSpace(question))
                        {
                            _knowledgeStore.Add(new KnowledgeItem(fileName, question, answer));
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error parsing CSV: {file}");
                }
            }

            _isInitialized = true;
            _logger.LogInformation($"Indexing complete. Total indexed items: {_knowledgeStore.Count}");
        }

        public List<KnowledgeItem> Search(string query, int topK = 3)
        {
            if (!_isInitialized || string.IsNullOrWhiteSpace(query))
                return new List<KnowledgeItem>();

            var tokens = query.ToLower().Split(new[] { ' ', '?', ',', '.', ':', '!' }, StringSplitOptions.RemoveEmptyEntries)
                              .Where(t => t.Length > 2)
                              .ToList();

            if (!tokens.Any())
                return new List<KnowledgeItem>();

            // رتبه‌بندی ساده و فوق‌العاده سریع با تطبیق کلیدواژه‌ها
            var ranked = _knowledgeStore
                .Select(item =>
                {
                    var text = (item.Question + " " + item.Answer).ToLower();
                    int score = tokens.Count(t => text.Contains(t));
                    return new { item, score };
                })
                .Where(x => x.score > 0)
                .OrderByDescending(x => x.score)
                .Take(topK)
                .Select(x => x.item)
                .ToList();

            return ranked;
        }
    }
}
