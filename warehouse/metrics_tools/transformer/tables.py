"""Transforms table references from an execution context
"""

import typing as t

from sqlglot import exp
from sqlmesh.core.context import ExecutionContext
from .base import Transform


class TableTransform(Transform):
    def transform_table_name(self, table: exp.Table) -> exp.Table | None:
        raise NotImplementedError("transform table not implemeented")

    def __call__(self, query: t.List[exp.Expression]) -> t.List[exp.Expression]:
        def transform_tables(node: exp.Expression):
            if not isinstance(node, exp.Table):
                return node
            actual_table = self.transform_table_name(node)
            if not actual_table:
                return node
            table_kwargs = {}
            if node.alias:
                table_kwargs["alias"] = node.alias
            return exp.to_table(actual_table.this.this, **table_kwargs)

        transformed_expressions = []
        for expression in query:
            transformed = expression.transform(transform_tables)
            transformed_expressions.append(transformed)
        return transformed_expressions


class MapTableTransform(TableTransform):
    def __init__(self, map: t.Dict[str, str]):
        self._map = map

    def transform_table_name(self, table: exp.Table) -> exp.Table | None:
        table_name = f"{table.db}.{table.this.this}"
        actual_name = self._map.get(table_name, None)
        if actual_name:
            return exp.to_table(actual_name)
        return None


class ExecutionContextTableTransform(TableTransform):
    def __init__(
        self,
        context: ExecutionContext,
    ):
        self._context = context

    def transform_table_name(self, table: exp.Table) -> exp.Table | None:
        table_name = f"{table.db}.{table.this.this}"
        try:
            return exp.to_table(self._context.table(table_name))
        except KeyError:
            return None
