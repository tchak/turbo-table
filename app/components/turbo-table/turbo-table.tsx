import { Table, ResizableTableContainer } from '~/components/ui/table';
import { useTurboTable } from './hooks';
import { TurboTableToolbar } from './turbo-table-toolbar';
import { TurboTableHeader } from './turbo-table-header';
import { TurboTableBody } from './turbo-table-body';
import { TurboPagination } from './turbo-pagination';

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
  sort?: { desc: boolean; id: string };
  group?: string;
  pageSize: number;
  columnVisibility: Record<string, boolean>;
  columnSizing: Record<string, number>;
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
    <div className="flex flex-col h-full">
      <TurboTableToolbar table={table} canHideColumns />
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
      {table.getPageCount() > 1 ? <TurboPagination table={table} /> : null}
    </div>
  );
}
