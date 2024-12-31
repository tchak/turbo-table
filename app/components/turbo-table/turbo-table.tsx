import type {
  ColumnSizingState,
  VisibilityState,
  GroupingState,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';

import { Table, ResizableTableContainer } from '~/components/ui/table';
import { useTurboTable } from './hooks';
import { TurboTableToolbar } from './turbo-table-toolbar';
import { TurboTableHeader } from './turbo-table-header';
import { TurboTableBody } from './turbo-table-body';

export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'json';

export type Column = {
  id: string;
  name: string;
  type: ColumnType;
};

export type Value = string | number | boolean | Date | null;

export type Row = {
  id: string;
  data: Record<string, Value>;
};

export type View = {
  sort?: SortingState[0];
  group?: GroupingState[0];
  pageSize: PaginationState['pageSize'];
  columnVisibility: VisibilityState;
  columnSizing: ColumnSizingState;
};

export function TurboTable({
  columns,
  data,
  view,
  onChange,
}: {
  columns: Column[];
  data: Row[];
  view: View;
  onChange?: (view: View) => void;
}) {
  const { table, onResize, ...tableProps } = useTurboTable({
    columns,
    data,
    view,
    onChange,
  });

  return (
    <div className="flex flex-col gap-2 h-full">
      <TurboTableToolbar table={table} />
      <ResizableTableContainer
        onResize={onResize}
        className="overflow-auto flex-1"
      >
        <Table
          aria-label="Items table"
          selectionMode="multiple"
          selectionBehavior="toggle"
          {...tableProps}
        >
          <TurboTableHeader table={table} />
          <TurboTableBody table={table} />
        </Table>
      </ResizableTableContainer>
      {/* <div className="flex-shrink-0">Footer</div> */}
    </div>
  );
}
