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
        checkpointer=request.app.state.checkpointer
    )


@router.post("/{thread_id}")
def chat(
    thread_id: str,
    request: ChatRequest,
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

    if request.decision:
        result = agent.invoke(
            Command(
                resume={
                    "decisions": [
                        request.decision.model_dump(
                            exclude_none=True
                        )
                    ]
                }
            ),
            config=config,
            version="v2"
        )

    elif request.message:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": request.message
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