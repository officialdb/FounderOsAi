"""auth hardening

Revision ID: 0003_auth_hardening
Revises: 0002_contract_stabilization
Create Date: 2026-06-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003_auth_hardening"
down_revision = "0002_contract_stabilization"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "refresh_token_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_refresh_token_sessions_user_id"), "refresh_token_sessions", ["user_id"], unique=False)
    op.create_index(op.f("ix_refresh_token_sessions_token_hash"), "refresh_token_sessions", ["token_hash"], unique=True)
    op.create_index(op.f("ix_refresh_token_sessions_expires_at"), "refresh_token_sessions", ["expires_at"], unique=False)

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("request_ip", sa.String(length=100), nullable=True),
        sa.Column("request_user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_password_reset_tokens_user_id"), "password_reset_tokens", ["user_id"], unique=False)
    op.create_index(op.f("ix_password_reset_tokens_token_hash"), "password_reset_tokens", ["token_hash"], unique=True)
    op.create_index(op.f("ix_password_reset_tokens_expires_at"), "password_reset_tokens", ["expires_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_password_reset_tokens_expires_at"), table_name="password_reset_tokens")
    op.drop_index(op.f("ix_password_reset_tokens_token_hash"), table_name="password_reset_tokens")
    op.drop_index(op.f("ix_password_reset_tokens_user_id"), table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")

    op.drop_index(op.f("ix_refresh_token_sessions_expires_at"), table_name="refresh_token_sessions")
    op.drop_index(op.f("ix_refresh_token_sessions_token_hash"), table_name="refresh_token_sessions")
    op.drop_index(op.f("ix_refresh_token_sessions_user_id"), table_name="refresh_token_sessions")
    op.drop_table("refresh_token_sessions")
