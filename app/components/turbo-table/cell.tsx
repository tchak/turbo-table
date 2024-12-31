import type { CellContext, Cell, Row } from '@tanstack/react-table';
import type { Column, Value } from './turbo-table';
import { flexRender } from '@tanstack/react-table';

import { Checkbox } from '~/components/ui/checkbox';
import { Toggle } from '~/components/ui/toggle';

export function TurboTableCell<T>({
  row,
  cell,
}: {
  row: Row<T>;
  cell: Cell<T, unknown>;
}) {
  if (cell.getIsPlaceholder() || cell.getIsAggregated()) {
    return null;
  }
  if (cell.getIsGrouped()) {
    <Toggle
      isSelected={row.getIsExpanded()}
      onChange={row.getToggleExpandedHandler()}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())} (
      {row.subRows.length})
    </Toggle>;
  }
  return flexRender(cell.column.columnDef.cell, cell.getContext());
}

export function getCellRenderer<T>(
  column: Column,
  formatters: { number: Intl.NumberFormat; date: Intl.DateTimeFormat }
) {
  return (context: CellContext<T, Value>) => {
    const value = context.getValue();
    if (value == null) {
      return null;
    }
    switch (column.type) {
      case 'boolean':
        return booleanCellRenderer(value);
      case 'number':
        return numberCellRenderer(value, formatters.number);
      case 'date':
        return dateCellRenderer(value, formatters.date);
      default:
        return String(value);
    }
  };
}

function booleanCellRenderer(value: Value) {
  return <Checkbox isReadOnly isSelected={value == true} />;
}

function numberCellRenderer(value: Value, formatter: Intl.NumberFormat) {
  if (isValidNumber(value)) {
    return formatter.format(value);
  }
  return null;
}

function dateCellRenderer(value: Value, formatter: Intl.DateTimeFormat) {
  if (isValidDate(value)) {
    return formatter.format(value);
  }
  return null;
}

function isValidNumber(value: Value): value is number {
  return typeof value == 'number' && !isNaN(value);
}

function isValidDate(value: Value): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}
