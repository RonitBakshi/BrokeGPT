from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware

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
        integration_service: IntegrationService,
        checkpointer,
        langfuse
    ):
        self.composio = composio
        self.integration_service = integration_service
        self.checkpointer = checkpointer
        self.langfuse = langfuse

    def create_agent(self, user_id: int):
        toolkits = self.integration_service.get_connected_toolkits()

        tools = self.composio.get_tools(
            user_id=str(user_id),
            toolkits=toolkits
        )

        interrupt_on = {
            tool.name: True
            for tool in tools
        }

        preferences = self.integration_service.get_tool_preferences()

        for preference in preferences:
            if not preference.hitl_enabled:
                interrupt_on[preference.tool_name] = False

        agent_prompt = self.langfuse.get_agent_prompt("agent_system_prompt")

        agent = create_agent(
            system_prompt=agent_prompt,
            model=llm,
            tools=tools,
            middleware=[
                DynamicToolMiddleware(),
                HumanInTheLoopMiddleware(
                    interrupt_on=interrupt_on
                )
            ],
            checkpointer=self.checkpointer
        )

        return agent