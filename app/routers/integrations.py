import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..services.integration_service import IntegrationService
from ..services.composio_service import ComposioService
from ..integrations.connection_store import (
    create_connection_attempt,
    get_connection_attempt,
    delete_connection_attempt,
)
from .auth import get_current_user


router = APIRouter(
    prefix="/integrations",
    tags=["integrations"]
)

# Dependency Injection Code
def get_integration_service(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> IntegrationService:
    return IntegrationService(
        db=db,
        user=current_user
    )


def get_composio_service() -> ComposioService:
    return ComposioService()


# Routes
@router.get("/")
def get_integrations(
    service: IntegrationService = Depends(get_integration_service)
):
    integrations = service.get_user_integrations()

    return [
        {
            "id": integration.id,
            "integration": integration.mcp_server,
            "connected": integration.connected
        }
        for integration in integrations
    ]


@router.post("/{integration}/connect")
def connect_integration(
    integration: str,
    service: IntegrationService = Depends(get_integration_service),
    composio: ComposioService = Depends(get_composio_service)
):
    toolkit = service.get_composio_toolkit(integration)

    if not toolkit:
        raise HTTPException(
            status_code=404,
            detail="Unsupported integration"
        )

    attempt_id = create_connection_attempt(
        user_id=service.user.id,
        integration=integration
    )

    callback_url = (
        "http://localhost:8000"
        f"/integrations/composio/callback"
        f"?attempt_id={attempt_id}"
    )

    result = composio.authorize(
        user_id=str(service.user.id),
        toolkit=toolkit,
        callback_url=callback_url
    )

    return {
        "integration": integration,
        "authorization_url": result.redirect_url
    }


@router.get("/composio/callback")
def composio_callback(
    attempt_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    attempt = get_connection_attempt(attempt_id)

    if not attempt:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired connection attempt"
        )

    delete_connection_attempt(attempt_id)

    if status != "success":
        return {
            "status": "failed",
            "integration": attempt["integration"]
        }

    user = (
        db.query(User)
        .filter(User.id == attempt["user_id"])
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User not found"
        )

    service = IntegrationService(
        db=db,
        user=user
    )

    connection = service.connect(
        attempt["integration"]
    )

    return {
        "status": "connected",
        "integration": connection.mcp_server
    }


@router.post("/{integration}/disconnect")
def disconnect_integration(
    integration: str,
    service: IntegrationService = Depends(get_integration_service)
):
    if not service.is_supported(integration):
        raise HTTPException(
            status_code=404,
            detail="Unsupported integration"
        )

    disconnected = service.disconnect(integration)

    if not disconnected:
        raise HTTPException(
            status_code=404,
            detail="Integration not connected"
        )

    return {
        "integration": integration,
        "connected": False
    }