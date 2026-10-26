
import re

from app.database import Base
import app.models  # noqa: F401 — register models with Base.metadata


SNAKE_CASE_PATTERN = re.compile(r"^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$")


def test_table_names_use_snake_case():
    table_names = list(Base.metadata.tables.keys())

    assert table_names, (
        "No SQLAlchemy tables were registered. "
        "Make sure the models are imported."
    )

    invalid_names = [
        name
        for name in table_names
        if not SNAKE_CASE_PATTERN.fullmatch(name)
    ]

    assert not invalid_names, (
        "Database table names must use snake_case. "
        f"Invalid names: {invalid_names}"
    )


def test_column_names_use_snake_case():
    invalid_columns = []

    for table in Base.metadata.tables.values():
        for column in table.columns:
            if not SNAKE_CASE_PATTERN.fullmatch(column.name):
                invalid_columns.append(
                    f"{table.name}.{column.name}"
                )

    assert not invalid_columns, (
        "Database column names must use snake_case. "
        f"Invalid columns: {invalid_columns}"
    )
