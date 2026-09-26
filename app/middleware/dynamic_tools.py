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

        tool_catalog = "\n".join(
            tool.name for tool in request.tools
        )

        updated_system_message = (
            f"{request.system_message}\n\n"
            "You can dynamically load tools.\n\n"
            f"Available tools:\n{tool_catalog}\n\n"
            "IMPORTANT TOOL RULES:\n\n"
            "- You MUST call bind_tool before using any tool.\n"
            "- A tool is available only after bind_tool has successfully loaded it."
        )

        updated = request.override(
            tools=[*tools, bind_tool],
            system_message=updated_system_message
        )
        
        return handler(updated)

    def wrap_tool_call(self, request: ToolCallRequest, handler):
        if request.tool_call["name"] == "bind_tool":
            return handler(request.override(tool=bind_tool))
        return handler(request)