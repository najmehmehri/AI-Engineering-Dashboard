namespace AIAssistant.Backend
{
    public record KnowledgeItem(string Source, string Topic, string Content);

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

            // اولویت با فولدر اختصاصی Petroleum
            var candidatePaths = new List<string>
            {
                @"D:\AI-HeavyEngineering-Dashboard\AIAssistant.Backend\KnowledgeBase\Petroleum",
                Path.Combine(env.ContentRootPath, "KnowledgeBase", "Petroleum"),
                Path.Combine(env.ContentRootPath, "KnowledgeBase"),
                Path.Combine(AppContext.BaseDirectory, "KnowledgeBase", "Petroleum")
            };

            var currentDir = new DirectoryInfo(env.ContentRootPath);
            while (currentDir != null)
            {
                var testPath = Path.Combine(currentDir.FullName, "KnowledgeBase", "Petroleum");
                if (!candidatePaths.Contains(testPath))
                    candidatePaths.Add(testPath);
                currentDir = currentDir.Parent;
            }

            _knowledgeBasePath = candidatePaths.FirstOrDefault(Directory.Exists) ?? candidatePaths.First();
            _logger.LogInformation($"[RAG Initialized] Targeted KnowledgeBase path: {_knowledgeBasePath} (Exists: {Directory.Exists(_knowledgeBasePath)})");
        }

        public async Task InitializeAsync()
        {
            if (_isInitialized) return;

            if (!Directory.Exists(_knowledgeBasePath))
            {
                _logger.LogWarning($"[RAG Warning] Directory not found at: {_knowledgeBasePath}");
                return;
            }

            _logger.LogInformation("[RAG Starting] Loading text engineering specifications...");
            _knowledgeStore.Clear();

            // فقط فایل‌های متنی .txt و .md ایندکس می‌شوند
            var textFiles = Directory.GetFiles(_knowledgeBasePath, "*.txt", SearchOption.AllDirectories)
                .Concat(Directory.GetFiles(_knowledgeBasePath, "*.md", SearchOption.AllDirectories));

            foreach (var filePath in textFiles)
            {
                try
                {
                    var fileContent = await File.ReadAllTextAsync(filePath);
                    var fileName = Path.GetFileName(filePath);

                    // تفکیک بر مبنای خطوط خالی (پاراگراف‌ها یا سکشن‌های مستقل)
                    var sections = fileContent.Split(new[] { "\r\n\r\n", "\n\n" }, StringSplitOptions.RemoveEmptyEntries);

                    foreach (var section in sections)
                    {
                        var trimmedSection = section.Trim();
                        if (string.IsNullOrWhiteSpace(trimmedSection)) continue;

                        var lines = trimmedSection.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                        string topic = lines.Length > 0 ? lines[0] : "Petroleum Engineering Spec";

                        _knowledgeStore.Add(new KnowledgeItem(fileName, topic, trimmedSection));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"[RAG Error] Failed to read text document: {filePath}");
                }
            }

            _isInitialized = true;
            _logger.LogInformation($"[RAG Ready] Indexed {_knowledgeStore.Count} text knowledge chunks.");
        }

        public List<KnowledgeItem> Search(string query, int topK = 3)
        {
            if (!_isInitialized || string.IsNullOrWhiteSpace(query))
                return new List<KnowledgeItem>();

            var tokens = query.ToLower()
                              .Split(new[] { ' ', '?', ',', '.', ':', '!', '؛', '،', '\t', '\r', '\n', '-', '_' }, StringSplitOptions.RemoveEmptyEntries)
                              .Where(t => t.Length > 2)
                              .Distinct()
                              .ToList();

            if (!tokens.Any())
                return new List<KnowledgeItem>();

            var ranked = _knowledgeStore
                .Select(item =>
                {
                    var fullText = (item.Topic + " " + item.Content).ToLower();
                    int score = tokens.Count(token => fullText.Contains(token));
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
