# app/routers/chat.py

from fastapi import APIRouter, Depends, HTTPException
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


def get_agent_service(
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
        integration_service=integration_service
    )


@router.post("/{thread_id}")
def chat(
    thread_id: str,
    message: str,
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

    result = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": message
            }
        ]
    })

    return {
        "thread_id": thread_id,
        "response": result["messages"][-1].content
    }