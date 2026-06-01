"""contract stabilization

Revision ID: 0002_contract_stabilization
Revises: 0001_initial_schema
Create Date: 2026-06-01 00:00:00.000000
"""

from alembic import op

revision = "0002_contract_stabilization"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_tasks_status",
        "tasks",
        "status IN ('todo', 'in_progress', 'done', 'overdue')",
    )
    op.create_check_constraint(
        "ck_outreach_status",
        "outreach_logs",
        "status IN ('pending', 'contacted', 'follow_up', 'responded', 'closed')",
    )
    op.create_unique_constraint(
        "uq_check_ins_workspace_check_in_date",
        "check_ins",
        ["workspace_id", "check_in_date"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_check_ins_workspace_check_in_date", "check_ins", type_="unique")
    op.drop_constraint("ck_outreach_status", "outreach_logs", type_="check")
    op.drop_constraint("ck_tasks_status", "tasks", type_="check")
