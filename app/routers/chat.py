# app/routers/chat.py
from pydantic import BaseModel
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from langgraph.types import Command
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..services.agent_service import AgentService
from ..services.composio_service import ComposioService
from ..services.integration_service import IntegrationService
from .auth import get_current_user
from ..services.thread_service import ThreadService

from slowapi import Limiter
from ..middleware.rate_limit import limiter


router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)


class HITLDecision(BaseModel):
    type: str
    message: str | None = None
    edited_action: dict[str, Any] | None = None


class ChatRequest(BaseModel):
    message: str | None = None
    decision: HITLDecision | None = None


def get_agent_service(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    integration_service = IntegrationService(
        db=db,
        user=current_user
    )

    composio = ComposioService()

    return AgentService(
        composio=composio,
        integration_service=integration_service,
        checkpointer=request.app.state.checkpointer,
        langfuse=request.app.state.langfuse,
        promptguard=request.app.state.promptguard
    )


@router.post("/{thread_id}")
@limiter.limit("10/minute")
def chat(
    request: Request,
    thread_id: str,
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    agent_service: AgentService = Depends(get_agent_service)
):
    thread_service = ThreadService(
        db=db,
        user=current_user
    )

    thread = thread_service.get_thread(thread_id)

    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found"
        )

    agent = agent_service.create_agent(
        user_id=current_user.id
    )

    prompt = agent_service.langfuse.get_prompt("agent_system_prompt")

    config = {
        "callbacks": [agent_service.langfuse.handler],
        "configurable": {
            "thread_id": thread_id
        },
        "metadata": {
            "langfuse_prompt": prompt,
            "langfuse_session_id": thread_id,
            "langfuse_user_id": str(current_user.id),
        }
    }

    if chat_request.decision:
        result = agent.invoke(
            Command(
                resume={
                    "decisions": [
                        chat_request.decision.model_dump(
                            exclude_none=True
                        )
                    ]
                }
            ),
            config=config,
            version="v2"
        )

    elif chat_request.message:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": chat_request.message
                    }
                ]
            },
            config=config,
            version="v2"
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Either message or decision is required"
        )

    if result.interrupts:
        interrupt = result.interrupts[0]

        return {
            "status": "approval_required",
            "thread_id": thread_id,
            "action_requests": interrupt.value[
                "action_requests"
            ],
            "review_configs": interrupt.value[
                "review_configs"
            ]
        }

    return {
        "status": "completed",
        "thread_id": thread_id,
        "response": result.value["messages"][-1].content
    }


@router.get("/{thread_id}/history")
def get_chat_history(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    agent_service: AgentService = Depends(get_agent_service)
):
    thread_service = ThreadService(
        db=db,
        user=current_user
    )

    thread = thread_service.get_thread(thread_id)

    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found"
        )

    agent = agent_service.create_agent(
        user_id=current_user.id
    )

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    state = agent.get_state(config)

    messages = []
    if state and state.values and "messages" in state.values:
        for msg in state.values["messages"]:
            msg_type = getattr(msg, "type", "assistant")
            role = "user" if msg_type in ("human", "user") else "assistant" if msg_type in ("ai", "assistant") else msg_type
            
            tool_calls = getattr(msg, "tool_calls", None)
            
            messages.append({
                "role": role,
                "content": msg.content if isinstance(msg.content, str) else str(msg.content),
                "tool_calls": tool_calls if tool_calls else None
            })

    pending_approval = None
    if state and state.tasks:
        for task in state.tasks:
            if getattr(task, "interrupts", None):
                interrupt = task.interrupts[0]
                pending_approval = {
                    "action_requests": interrupt.value.get("action_requests", []),
                    "review_configs": interrupt.value.get("review_configs", [])
                }
                break

    return {
        "thread_id": thread_id,
        "messages": messages,
        "pending_approval": pending_approval
    }