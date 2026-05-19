"""add closed_at to trades

Revision ID: 9a4c2b1d3e7f
Revises: 85190247a16c
Create Date: 2026-05-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9a4c2b1d3e7f'
down_revision = '85190247a16c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'trades',
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_column('trades', 'closed_at')
