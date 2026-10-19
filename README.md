# AI Heavy Engineering Dashboard

An advanced, domain-specific AI copilot and engineering dashboard for heavy engineering workflows. The platform combines a React and Vite frontend with a .NET 8 Web API backend, Microsoft Semantic Kernel orchestration, a local Ollama language model, and a domain-specific Retrieval-Augmented Generation (RAG) pipeline.

## Development Status

This project is currently under active development.

The project is currently in **Phase 1: Petroleum and Petrochemical Engineering RAG and copilot integration**. The present implementation focuses on petroleum field specifications, wellhead systems, hydrostatic testing, engineering standards, and engineering question answering.

Future development phases will expand the platform to the following domains:

- Structural and Civil Engineering
- Metallurgy and Materials Science
- Advanced Manufacturing

Features, interfaces, APIs, knowledge sources, and model behavior may change as the project progresses.

## Overview

The dashboard is designed to provide a focused engineering assistant that can retrieve relevant technical context from curated domain documents and use that context to generate grounded answers. The initial knowledge domain is Petroleum and Petrochemical Engineering, with a focus on field-oriented specifications and standards.

The architecture is designed to support:

- Domain-specific assistant roles
- Local and privacy-oriented model execution
- Retrieval of relevant engineering documents before generation
- Streaming responses from the backend to the frontend
- Persian and English UTF-8 content
- Contextual chat sessions
- Cancellation of an in-progress generation request
- Future expansion into additional engineering disciplines

## Key Features

### Phase 1 Petroleum and Petrochemical Capabilities

- Wellhead and wellhead equipment information
- Hydrostatic test requirements
- Multiphase flow and reservoir engineering context
- Field specification retrieval
- API Spec 6A and ASME B31.3 references in the initial knowledge domain
- Engineering question answering using retrieved technical context

### Retrieval-Augmented Generation

- Text-based chunking and indexing for domain knowledge files
- Retrieval of relevant context for each user query
- Separation of retrieval content from future structured training data
- Support for Markdown and text-based engineering references
- In-memory retrieval service in the initial implementation

Structured data such as CSV and JSON can be reserved for future analytics, evaluation, dataset preparation, or fine-tuning workflows rather than being treated as live retrieval content by default.

### Real-Time Interaction

- Token-by-token or chunked streaming responses
- Explicit UTF-8 support for Persian and English
- Cancellation tokens for stopping an active generation
- Assistant role switching within the chat interface
- Contextual session memory

### User Interface

- Responsive React dashboard
- Collapsible history and role navigation areas
- Dark and light themes
- Glassmorphism-based visual system
- Engineering-oriented role selection
- Layout designed for repeated technical question-and-answer workflows

## System Architecture

```text
+---------------------------------+
|      Assistant Frontend     |  Port 5174
|  - Dashboard UI and theming     |
|  - Role selection and chat      |
|  - Fetch-based response stream  |
+----------------+----------------+
                 |
                 | HTTP POST /api/chat
                 | JSON request and streamed response
                 v
+---------------------------------+
|       .NET 8 Web API Backend    |  Port 5060
|  - API endpoints                |
|  - Request validation            |
|  - Semantic Kernel orchestration|
|  - PetroleumRagService          |
|  - Response streaming           |
+----------------+----------------+
                 |
                 | OpenAI-compatible HTTP API
                 | http://localhost:11434/v1
                 v
+---------------------------------+
|          Ollama Runtime         |  Port 11434
|  - Local language model         |
|  - llama3-fa:latest             |
|  - Low-temperature generation   |
+---------------------------------+

Knowledge files
       |
       v
+---------------------------------+
| Domain Knowledge Base           |
| petroleum_field_spec.txt        |
| Chunking, indexing, retrieval   |
+---------------------------------+
```

### Request Flow

1. A user selects an engineering role and submits a question in the React dashboard.
2. The frontend sends the request to the backend chat endpoint.
3. The backend identifies the active domain and retrieves relevant chunks from the knowledge base.
4. Microsoft Semantic Kernel coordinates the prompt and model interaction.
5. The backend sends the request to the local Ollama OpenAI-compatible endpoint.
6. The generated response is streamed back to the frontend.
7. The dashboard renders the response while preserving the active conversation context.

## Technology Stack

### Frontend

- React 18
- Vite
- JavaScript and JSX
- Lucide Icons
- CSS-based responsive layout and glassmorphism styling
- Fetch API for backend communication and streamed responses

### Backend

- .NET 8 Web API
- C# 12
- ASP.NET Core
- Microsoft Semantic Kernel
- In-memory domain-specific RAG service
- HTTP streaming response support

### Model Runtime

- Ollama
- Model: `llama3-fa:latest`
- OpenAI-compatible local endpoint: `http://localhost:11434/v1`
- Initial generation configuration uses a low temperature, approximately `0.05`, for more deterministic technical responses

### Knowledge Base

- Plain-text domain specifications
- Initial file: `petroleum_field_spec.txt`
- Initial domain: Petroleum and Petrochemical Engineering

## Prerequisites

Install the following software before starting the application:

1. .NET 8 SDK
2. Node.js 18 or later
3. npm
4. Ollama
5. The `llama3-fa:latest` Ollama model

Pull the model with:

```bash
ollama pull llama3-fa:latest
```

Verify that the required tools are available:

```bash
dotnet --version
node --version
npm --version
ollama --version
```

## Installation and Local Setup

### 1. Start Ollama

Start the Ollama service in a separate terminal if it is not already running:

```bash
ollama serve
```

Confirm that the model is installed:

```bash
ollama list
```

The backend expects the Ollama service to be available at:

```text
http://localhost:11434/v1
```

### 2. Restore and Run the Backend

Open a terminal in the repository root and run:

```bash
cd AIAssistant.Backend
dotnet restore
dotnet run
```

The backend is expected to be available at:

```text
http://localhost:5060
```

Health check endpoint:

```text
http://localhost:5060/health
```

### 3. Install and Run the Frontend

Open another terminal in the repository root and run:

```bash
cd AI_Dashboard
npm install
npm run dev
```

The Vite development server is expected to be available at:

```text
http://localhost:5174
```

Open that address in a browser after both the backend and Ollama service are running.

## Configuration

The initial application is intended for local development. Before deploying to a shared or production environment, review and externalize at least the following settings:

- Backend listening URL and port
- Frontend API base URL
- Ollama endpoint
- Ollama model name
- Model temperature and generation limits
- Allowed origins and CORS policy
- Request timeouts and cancellation behavior
- Knowledge-base file locations
- Logging and error handling policy

Do not commit production secrets, private endpoints, or credentials to the repository. Local model execution does not remove the need for access control, input validation, and secure deployment practices.

## Verification and Test Query

To verify the initial RAG flow and model integration:

1. Start Ollama.
2. Start the .NET backend.
3. Start the React frontend.
4. Select the **Petroleum** role in the dashboard.
5. Submit the following query:

```text
کد تجهیزات سرچاهی چاه ۱۴ آزادگان چیست و فشار تست هیدرواستاتیک منیفولد آن طبق چه استانداردی و چند بار تعیین شده است؟
```

Expected verified output from the initial sample knowledge base:

- Wellhead equipment code: `AZ-HEX-9942`
- Hydrostatic test pressure: `485 bar`
- Standard: `API Spec 6A` with `PSL-3`

This query is a functional integration check for the sample knowledge base and local model connection. The expected values are only valid when the referenced sample specification is present and has not been changed.

## API and Integration Notes

The primary frontend-to-backend interaction is expected to use:

```text
POST /api/chat
```

The request contains the user question, selected role or domain, and conversation context as supported by the current backend implementation. The response is streamed so that the interface can display generated content progressively.

The backend also exposes a health endpoint:

```text
GET /health
```

A successful health response confirms that the API process is available. It does not by itself guarantee that Ollama is running or that the configured model is installed; those dependencies should be verified separately.

## Repository Structure

```text
.
├── AIAssistant.Backend/             # .NET 8 Web API backend
│   ├── KnowledgeBase/               # Domain knowledge files
│   │   └── Petroleum/
│   │       └── petroleum_field_spec.txt
│   ├── PetroleumRagService.cs       # RAG retrieval and indexing service
│   ├── Program.cs                   # API routes and Semantic Kernel setup
│   └── AIAssistant.Backend.csproj   # Backend project definition
├── AI_Dashboard/                    # React and Vite frontend
│   ├── src/
│   │   ├── App.jsx                  # Main dashboard layout and state
│   │   ├── main.jsx                 # Frontend entry point
│   │   └── index.css                # Global styles and themes
│   ├── package.json                 # Frontend dependencies and scripts
│   └── vite.config.js               # Vite configuration
├── .gitignore
└── README.md
```

The tree documents the intended project layout. Additional generated files, test projects, environment files, or deployment configuration may be added as implementation evolves.

## Development Roadmap

### Phase 1: Petroleum and Petrochemical Engineering

Current phase. This phase covers the RAG pipeline and copilot integration for petroleum and petrochemical engineering, including field specifications, wellhead equipment, testing requirements, and standards-oriented question answering.

### Future Phase: Structural and Civil Engineering

Planned expansion to structural analysis, nonlinear finite element methods, seismic design, wind loads, and engineering standards such as AISC, ACI, and ASCE.

### Future Phase: Metallurgy and Materials Science

Planned expansion to alloy selection, phase diagrams, heat treatment, creep, fatigue, and materials standards such as ASTM, DIN, and AISI.

### Future Phase: Advanced Manufacturing

Planned expansion to five-axis CNC machining, Design for Manufacturing and Assembly, welding procedures, statistical process control, and precision casting.

## Engineering and Safety Considerations

This project is an engineering information and assistance tool. Generated answers must be reviewed by qualified engineers before being used for design approval, procurement, fabrication, operations, inspection, maintenance, safety decisions, or regulatory submissions.

The assistant should not be treated as a replacement for applicable codes, standards, approved drawings, verified calculations, manufacturer documentation, site procedures, or professional engineering judgment.

## Troubleshooting

### The frontend cannot connect to the backend

- Confirm that the backend is running on port `5060`.
- Confirm that the frontend is configured to use the correct API base URL.
- Check browser developer tools for CORS or network errors.
- Confirm that the requested backend route matches `/api/chat`.

### The backend cannot reach Ollama

- Confirm that `ollama serve` is running.
- Check that Ollama is available at `http://localhost:11434`.
- Run `ollama list` and verify that `llama3-fa:latest` is installed.
- Review backend logs for endpoint, timeout, or model-name errors.

### The expected verification answer is not returned

- Confirm that `petroleum_field_spec.txt` exists in the configured knowledge-base path.
- Confirm that the Petroleum role is selected.
- Check that the sample document still contains the verification values.
- Review retrieval logs and model configuration.
- Remember that a generated response should be validated against the source specification.

## Contributing

Contributions should be focused, documented, and compatible with the current architecture. When adding a new engineering domain:

1. Add domain knowledge in a clearly separated directory.
2. Define the domain role and retrieval behavior.
3. Add representative verification queries with source-backed expected results.
4. Update the backend and frontend documentation.
5. Add tests for retrieval, API behavior, and user-facing integration where applicable.
6. Keep technical standards and source documents traceable.

## License

This project is currently developed for internal engineering evaluation, domain-specific AI assistance research, and iterative product development. A formal open-source license has not yet been specified.

