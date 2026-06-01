import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.users.models import User
from app.workspaces.models import Workspace


class AIGeneration(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_generations"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True, index=True
    )
    generation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    extra_metadata: Mapped[dict[str, object]] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    user = relationship(User, lazy="joined")
    workspace = relationship(Workspace, lazy="joined")
