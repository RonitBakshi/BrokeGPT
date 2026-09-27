# BrokeGPT

AI agent platform built with FastAPI, LangGraph, Composio, Langfuse, and PromptGuard.

## Setup

### 1. Create virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file:

```env
GROQ_API_KEY=your-key
COMPOSIO_API_KEY=your-key

LANGFUSE_PUBLIC_KEY=your-key
LANGFUSE_SECRET_KEY=your-key
LANGFUSE_HOST=https://cloud.langfuse.com

PROMPTGUARD_API_KEY=your-key
```

### 4. Start PostgreSQL

```bash
docker compose up -d
```

### 5. Start the API

```bash
uvicorn app.main:app --reload
```

API:

```text
http://localhost:8000
```

Swagger UI:

```text
http://localhost:8000/docs
```

## Stop PostgreSQL

```bash
docker compose down
```
