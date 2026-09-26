from sqlalchemy.orm import Session

from ..integrations import SUPPORTED_INTEGRATIONS
from ..models import User, UserMCPConnection


class IntegrationService:

    def __init__(
        self,
        db: Session,
        user: User
    ):
        self.db = db
        self.user = user

    def is_supported(
        self,
        integration: str
    ) -> bool:
        return integration in SUPPORTED_INTEGRATIONS

    def get_user_integrations(
        self
    ) -> list[UserMCPConnection]:

        print(f"User Id: {self.user.id}")
        
        return (
            self.db.query(UserMCPConnection)
            .filter(
                UserMCPConnection.user_id == self.user.id
            )
            .all()
        )

    def get_composio_toolkit(
        self,
        integration: str
    ) -> str | None:
        return SUPPORTED_INTEGRATIONS.get(integration)

    def connect(
        self,
        integration: str
    ) -> UserMCPConnection:

        connection = (
            self.db.query(UserMCPConnection)
            .filter(
                UserMCPConnection.user_id == self.user.id,
                UserMCPConnection.mcp_server == integration
            )
            .first()
        )

        if connection:
            connection.connected = True
        else:
            connection = UserMCPConnection(
                user_id=self.user.id,
                mcp_server=integration,
                connected=True
            )

            self.db.add(connection)

        self.db.commit()
        self.db.refresh(connection)

        return connection

    def disconnect(
        self,
        integration: str
    ) -> bool:

        connection = (
            self.db.query(UserMCPConnection)
            .filter(
                UserMCPConnection.user_id == self.user.id,
                UserMCPConnection.mcp_server == integration
            )
            .first()
        )

        if not connection:
            return False

        connection.connected = False

        self.db.commit()

        return True