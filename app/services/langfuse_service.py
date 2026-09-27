from langfuse import get_client
from langfuse.langchain import CallbackHandler


class LangfuseService:

    def __init__(self):
        self.client = get_client()
        self.client.auth_check()
        self.handler = CallbackHandler()

    def get_prompt(self, name: str):
        return self.client.get_prompt(name)

    def get_agent_prompt(self, name: str):
        prompt = self.get_prompt(name=name)

        return prompt.get_langchain_prompt()
