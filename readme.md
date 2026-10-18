# BrokeGPT

AI agent platform built with FastAPI, LangGraph, Composio, Langfuse, and PromptGuard.

## About

BrokeGPT is an AI agent app that connects language models to external services and lets them use those services' tools in a conversation. Building it has been a hands-on way to learn how the parts of a practical agent system fit together—from creating a FastAPI backend and integrating external services to adding user controls, security checks, and observability.

- Connected external services through MCP and OAuth, using Composio for integrations and authentication.
- Added human-in-the-loop controls to review, edit, approve, or reject tool requests.
- Integrated Prompt Guard to detect prompt injections and mask sensitive information.
- Implemented agent prompt versioning and conversation session management.
- Added checkpoints so conversations can pause and resume.
- Traced sessions in Langfuse, linked to user and thread IDs.


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
