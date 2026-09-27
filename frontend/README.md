# BrokeGPT Frontend

Modern AI-Chat interface for BrokeGPT built with React, Vite, TypeScript, and Lucide icons.

## Features
- **Modern AI Chat**: Clean ChatGPT / Claude style interface with user and assistant message styling, markdown code block formatting, auto-scroll, and empty-state suggestion prompts.
- **Thread Management**:
  - Full sidebar with recent conversations
  - "+ New Chat" action
  - Thread switching
  - Thread deletion with inline confirmation
- **Human-In-The-Loop (HITL) Workflow**:
  - When backend returns `status: "approval_required"`, an interactive card displays the intercepted tool call and its arguments.
  - **Approve**: Resumes agent execution immediately.
  - **Reject**: Allows entering an optional rejection reason so the agent can adapt.
  - **Edit Action**: Opens a dedicated modal where you can edit tool parameters (JSON) before execution.
- **Integrations & Tool HITL Settings**:
  - View connected MCP servers (Slack, Notion, Jira).
  - Connect / disconnect OAuth integrations.
  - Inspect all tools provided by MCP toolkits.
  - Toggle Human-in-the-Loop on/off per tool (persisted to backend database).
  - Add custom tool preferences.
- **Authentication**:
  - Sign up and Sign in tabs with validation and error alerts.
  - JWT token stored in `localStorage` and injected via Bearer authorization headers.
  - Automatic token verification (`GET /auth/me`) and clean logout on 401s.

## Getting Started

### 1. Prerequisites
Ensure Node.js 20+ and npm are installed:
```bash
node -v
npm -v
```

### 2. Install dependencies
```bash
cd frontend
npm install
```

### 3. Start development server
```bash
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173).

Requests to `/auth`, `/threads`, `/chat`, and `/integrations` are automatically proxied by Vite to the FastAPI backend at `http://localhost:8000` to prevent CORS issues.

### 4. Build for production
```bash
npm run build
```
Generates production build in `dist/`.
