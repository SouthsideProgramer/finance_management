# Thiết kế AI Service

## AI Flow

```mermaid
flowchart TD
    A[User Question] --> B[Backend<br/>POST /api/chat]
    B --> C[Prompt Builder]
    C --> D[System Prompt<br/>prompts/system.txt]
    C --> E[Chat History<br/>từ DB]
    C --> F[User Message]
    D --> G[OpenAI API]
    E --> G
    F --> G
    G --> H{Cần dùng tool?}
    H -->|Có| I[Execute Tool<br/>search / sql / weather]
    I --> J[Append result vào context]
    J --> G
    H -->|Không| K[Return Response]
    K --> L[Lưu vào DB]
    L --> M[Trả về Frontend]
```

## Components

### LLM (`llm.py`)

```python
# Supported providers
- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic (Claude)
- Local (Ollama)
```

### Prompt Builder

**System Prompt** (`prompts/system.txt`)
- Vai trò: Trợ lý tài chính FinCalc
- Ngôn ngữ: Tiếng Việt
- Phạm vi: Tiết kiệm, đầu tư, vay, phân tích tài chính

**User Prompt**
```
{system_prompt}

---Lịch sử---
{chat_history}

---Câu hỏi hiện tại---
{user_message}
```

### Tools

| Tool | File | Mô tả | Khi nào dùng |
|------|------|-------|---------------|
| Search | `tools/search.py` | Tìm kiếm web | Câu hỏi về tin tức tài chính |
| SQL | `tools/sql.py` | Query database | Câu hỏi về số liệu cá nhân |
| Weather | `tools/weather.py` | Thời tiết | Phân tích ngành du lịch/nông nghiệp |

### RAG (Retrieval-Augmented Generation)

```mermaid
flowchart LR
    A[User Query] --> B[Embedding<br/>rag/embedding.py]
    B --> C[Vector Store<br/>rag/vector_store.py]
    C --> D[Top-K Results<br/>rag/retrieval.py]
    D --> E[Injected vào Prompt]
```

- **Embedding**: sentence-transformers hoặc OpenAI embeddings
- **Vector Store**: ChromaDB / Pinecone / pgvector
- **Use case**: Tìm kiếm document tài chính, FAQ

## Cấu hình

```env
# .env
AI_PROVIDER=openai          # openai | anthropic | ollama
AI_MODEL=gpt-4              # model name
OPENAI_API_KEY=sk-...       # API key
RAG_ENABLED=false           # bật/tắt RAG
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

## Streaming (tương lai)

```mermaid
sequenceDiagram
    participant U as Frontend
    participant B as Backend
    participant O as OpenAI

    U->>B: POST /api/chat (stream=true)
    B->>O: Chat Completion (stream)
    loop Mỗi token
        O-->>B: token
        B-->>U: SSE event
    end
    B->>B: Lưu full response vào DB
```
