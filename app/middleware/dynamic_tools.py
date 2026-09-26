from langchain.agents.middleware import AgentMiddleware, ToolCallRequest
from langchain.tools import tool


@tool
def bind_tool(tool_name: str) -> str:
    """Bind a tool so it can be used by the agent."""
    return f"Tool '{tool_name}' bound successfully."


class DynamicToolMiddleware(AgentMiddleware):
    def wrap_model_call(self, request, handler):
        bind_tool_names = set()

        for message in reversed(request.messages):
            if message.type == 'tool':
                continue

            if message.type == 'ai':
                for tool_call in message.tool_calls:
                    if tool_call["name"] == "bind_tool":
                        bind_tool_names.add(
                            tool_call["args"]["tool_name"]
                        )
                break
            
            break

        tools = [
            tool
            for tool in request.tools
            if tool.name in bind_tool_names
        ]

        updated = request.override(tools=[*tools, bind_tool])
        return handler(updated)

    def wrap_tool_call(self, request: ToolCallRequest, handler):
        if request.tool_call["name"] == "bind_tool":
            return handler(request.override(tool=bind_tool))
        return handler(request)