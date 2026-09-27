from promptguard import GuardClient


class PromptGuardService:

    def __init__(self, api_key: str):
        self.client = GuardClient(
            api_key=api_key
        )

    def scan_input(self, messages):
        return self.client.scan(
            messages=messages,
            direction="input"
        )

    def scan_output(self, messages):
        return self.client.scan(
            messages=messages,
            direction="output"
        )

    def close(self):
        self.client.close()