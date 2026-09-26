from contextlib import asynccontextmanager
from fastapi import FastAPI

from dotenv import load_dotenv

load_dotenv()

from .database import DatabaseService
from .routers.auth import router as auth_router
from .routers.threads import router as threads_router
from .routers.integrations import router as integrations_router
from .routers.chat import router as chat_router
from . import models


@asynccontextmanager
async def lifespan(app: FastAPI):

    database = DatabaseService(
        "sqlite:///./app.db"
    )

    database.create_tables()

    app.state.database = database

    yield

    database.close()


app = FastAPI(
    title="Agent Platform",
    lifespan=lifespan
)

app.include_router(auth_router)
app.include_router(threads_router)
app.include_router(integrations_router)
app.include_router(chat_router)