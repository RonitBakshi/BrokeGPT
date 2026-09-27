from sqlalchemy.orm import Session

from ..integrations import SUPPORTED_INTEGRATIONS
from ..models import User, UserMCPConnection, UserToolPreference


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

    def get_connected_toolkits(self) -> list[str]:
        integrations = self.get_user_integrations()

        toolkits = []

        for integration in integrations:
            if not integration.connected:
                continue

            toolkit = self.get_composio_toolkit(
                integration.mcp_server
            )

            if toolkit:
                toolkits.append(toolkit)

        return toolkits

    def get_tool_preferences(self) -> list[UserToolPreference]:
        return (
            self.db.query(UserToolPreference)
            .filter(
                UserToolPreference.user_id == self.user.id
            )
            .all()
        )

    def get_tool_preference(
        self,
        integration: str,
        tool_name: str
    ) -> UserToolPreference | None:
        return (
            self.db.query(UserToolPreference)
            .filter(
                UserToolPreference.user_id == self.user.id,
                UserToolPreference.mcp_server == integration,
                UserToolPreference.tool_name == tool_name
            )
            .first()
        )

    def set_tool_preference(
        self,
        integration: str,
        tool_name: str,
        enabled: bool
    ) -> UserToolPreference:
        preference = (
            self.db.query(UserToolPreference)
            .filter(
                UserToolPreference.user_id == self.user.id,
                UserToolPreference.mcp_server == integration,
                UserToolPreference.tool_name == tool_name
            )
            .first()
        )

        if preference:
            preference.hitl_enabled = enabled
        else:
            preference = UserToolPreference(
                user_id=self.user.id,
                mcp_server=integration,
                tool_name=tool_name,
                hitl_enabled=enabled
            )

            self.db.add(preference)

        self.db.commit()
        self.db.refresh(preference)

        return preference