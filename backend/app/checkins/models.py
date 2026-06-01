from datetime import date
import uuid

from sqlalchemy import Date, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.workspaces.models import Workspace


class CheckIn(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "check_ins"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    mood: Mapped[str | None] = mapped_column(Text, nullable=True)
    wins: Mapped[str | None] = mapped_column(Text, nullable=True)
    blockers: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    extra_metadata: Mapped[dict[str, object]] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    workspace = relationship(Workspace, lazy="joined")
