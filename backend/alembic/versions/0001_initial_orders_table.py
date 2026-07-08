"""initial orders table

Revision ID: 0001
Revises:
Create Date: 2026-07-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

# create_type=False: the type itself is created once, explicitly, via a
# guarded DO block below (using the generic sa.Enum -- or letting column DDL
# create it -- causes a duplicate "already exists" error on Postgres because
# it tries to create the type a second time).
order_status_enum = ENUM(
    "Pending", "Processing", "Completed", "Cancelled",
    name="order_status", create_type=False,
)


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
                CREATE TYPE order_status AS ENUM ('Pending', 'Processing', 'Completed', 'Cancelled');
            END IF;
        END
        $$;
        """
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("customer_name", sa.String(length=120), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", order_status_enum, nullable=False, server_default="Pending"),
        sa.Column("amount_usd", sa.Numeric(10, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_orders_created_at", "orders", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_orders_created_at", table_name="orders")
    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_table("orders")
    op.execute("DROP TYPE IF EXISTS order_status")
