import uuid


pending_connections = {}


def create_connection_attempt(
    user_id: int,
    integration: str
) -> str:
    attempt_id = str(uuid.uuid4())

    pending_connections[attempt_id] = {
        "user_id": user_id,
        "integration": integration,
    }

    return attempt_id


def get_connection_attempt(
    attempt_id: str
):
    return pending_connections.get(attempt_id)


def delete_connection_attempt(
    attempt_id: str
):
    pending_connections.pop(attempt_id, None)