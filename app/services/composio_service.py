from composio import Composio
from composio_langchain import LangchainProvider


class ComposioService:

    def __init__(self):
        self.client = Composio(
            provider=LangchainProvider()
        )

    def create_session(
        self,
        user_id: str
    ):
        return self.client.sessions.create(
            user_id=user_id
        )

    def authorize(
        self,
        user_id: str,
        toolkit: str,
        callback_url: str
    ):
        session = self.create_session(user_id)

        return session.authorize(
            toolkit=toolkit,
            callback_url=callback_url
        )