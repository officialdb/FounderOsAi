from datetime import date
import uuid

from sqlalchemy import CheckConstraint, Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.workspaces.models import Workspace


class OutreachLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "outreach_logs"
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'contacted', 'follow_up', 'responded', 'closed')", name="ck_outreach_status"),
    )

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_channel: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_metadata: Mapped[dict[str, object]] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    workspace = relationship(Workspace, lazy="joined")
