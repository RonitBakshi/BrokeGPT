from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


class DatabaseService:
    def __init__(self, database_url: str):
        self.engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False}
        )

        self.session_factory = sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False
        )

    def create_tables(self):
        Base.metadata.create_all(bind=self.engine)

    def get_session(self):
        return self.session_factory()

    def close(self):
        self.engine.dispose()


def get_db(request: Request):
    db_service: DatabaseService = request.app.state.database

    db = db_service.get_session()

    try:
        yield db
    finally:
        db.close()