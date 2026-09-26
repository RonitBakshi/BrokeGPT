import uuid

from sqlalchemy.orm import Session

from ..models import Thread, User


class ThreadService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def create_thread(self, title: str) -> Thread:
        thread = Thread(
            id=str(uuid.uuid4()),
            user_id=self.user.id,
            title=title
        )

        self.db.add(thread)
        self.db.commit()
        self.db.refresh(thread)

        return thread

    def get_thread(self, thread_id: str) -> Thread | None:
        return (
            self.db.query(Thread)
            .filter(
                Thread.id == thread_id,
                Thread.user_id == self.user.id
            )
            .first()
        )

    def get_user_threads(self) -> list[Thread]:
        return (
            self.db.query(Thread)
            .filter(
                Thread.user_id == self.user.id
            )
            .all()
        )

    def delete_thread(self, thread_id: str) -> bool:
        thread = self.get_thread(thread_id)

        if not thread:
            return False

        self.db.delete(thread)
        self.db.commit()

        return True