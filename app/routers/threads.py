from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..services.thread_service import ThreadService
from .auth import get_current_user


router = APIRouter(
    prefix="/threads",
    tags=["threads"]
)


def get_thread_service(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ThreadService:
    return ThreadService(
        db=db,
        user=current_user
    )


@router.post("/")
def create_thread(
    title: str = "New conversation",
    service: ThreadService = Depends(get_thread_service)
):
    thread = service.create_thread(title)

    return {
        "id": thread.id,
        "title": thread.title
    }


@router.get("/")
def get_threads(
    service: ThreadService = Depends(get_thread_service)
):
    threads = service.get_user_threads()

    return [
        {
            "id": thread.id,
            "title": thread.title,
            "created_at": thread.created_at,
            "updated_at": thread.updated_at
        }
        for thread in threads
    ]


@router.get("/{thread_id}")
def get_thread(
    thread_id: str,
    service: ThreadService = Depends(get_thread_service)
):
    thread = service.get_thread(thread_id)

    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found"
        )

    return {
        "id": thread.id,
        "title": thread.title,
        "created_at": thread.created_at,
        "updated_at": thread.updated_at
    }


@router.delete("/{thread_id}")
def delete_thread(
    thread_id: str,
    service: ThreadService = Depends(get_thread_service)
):
    deleted = service.delete_thread(thread_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Thread not found"
        )

    return {
        "message": "Thread deleted"
    }