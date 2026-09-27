from langchain.agents.middleware import AgentMiddleware, hook_config
from langchain.messages import AIMessage


class PromptGuardMiddleware(AgentMiddleware):

    def __init__(self, promptguard):
        self.promptguard = promptguard
        super().__init__()

    @hook_config(can_jump_to=["end"])
    def before_agent(self, state, runtime):
        message = state["messages"][-1]
        if message.type != "human":
            return None

        decision = self.promptguard.scan_input(
            messages=[{"role": "user", "content": message.content}]
        )

        if decision.blocked:
            return {
                "messages": [
                    AIMessage(f"I can't help with that request ({decision.threat_type}).")
                ],
                "jump_to": "end",
            }
        return None

    def after_agent(self, state, runtime):
        message = state["messages"][-1]
        if message.type != "ai":
            return None

        decision = self.promptguard.scan_output(
            messages=[{"role": "assistant", "content": message.content}]
        )

        if decision.blocked:
            # Mutate in place rather than appending a new message —
            # this replaces the flagged content instead of leaving it
            # in the conversation history alongside a refusal.
            message.content = "I generated a response that didn't pass a safety check, so I can't share it."
        return None