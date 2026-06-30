"""add password_hash to users

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""
import sqlalchemy as sa

from alembic import op

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add with a server default so existing rows get an empty string,
    # then drop the default so new rows must supply it explicitly.
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(255), nullable=False, server_default=sa.text("''")),
    )
    op.alter_column("users", "password_hash", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "password_hash")
