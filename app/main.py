from contextlib import asynccontextmanager
from fastapi import FastAPI

from dotenv import load_dotenv

load_dotenv()

from .database import DatabaseService
from .services.langfuse_service import LangfuseService
from .routers.auth import router as auth_router
from .routers.threads import router as threads_router
from .routers.integrations import router as integrations_router
from .routers.chat import router as chat_router
from .services.promptguard_service import PromptGuardService
from langgraph.checkpoint.memory import InMemorySaver

from .middleware.rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import os


@asynccontextmanager
async def lifespan(app: FastAPI):

    database = DatabaseService(
        "sqlite:///./app.db"
    )

    database.create_tables()

    checkpointer = InMemorySaver()
    langfuse = LangfuseService()

    promptguard = PromptGuardService(
        api_key=os.environ.get("PROMPTGUARD_API_KEY")
    )

    app.state.database = database
    app.state.checkpointer = checkpointer
    app.state.langfuse = langfuse
    app.state.promptguard = promptguard

    yield

    database.close()
    promptguard.close()


app = FastAPI(
    title="Agent Platform",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

app.include_router(auth_router)
app.include_router(threads_router)
app.include_router(integrations_router)
app.include_router(chat_router)