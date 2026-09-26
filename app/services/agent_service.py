from langchain.agents import create_agent

from .composio_service import ComposioService
from .integration_service import IntegrationService
from ..middleware import DynamicToolMiddleware

from langchain_groq import ChatGroq

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    max_tokens=500
)

# llm = ChatOpenRouter(
#     # model="inclusionai/ling-3.0-flash-fin:free",
#     model="nvidia/nemotron-3-super-120b-a12b:free",
#     temperature=0,
# )


class AgentService:

    def __init__(
        self,
        composio: ComposioService,
        integration_service: IntegrationService
    ):
        self.composio = composio
        self.integration_service = integration_service

    def create_agent(self, user_id: int):
        toolkits = self.integration_service.get_connected_toolkits()

        tools = self.composio.get_tools(
            user_id=str(user_id),
            toolkits=toolkits
        )

        agent = create_agent(
            model=llm,
            tools=tools,
            middleware=[
                DynamicToolMiddleware()
            ]
        )

        return agent