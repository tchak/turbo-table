import type { Table, RowData } from '@tanstack/react-table';

import { TurboTableCell } from './cell';
import { TableBody, Row, Cell } from '~/components/ui/table';

export function TurboTableBody<T extends RowData>({
  table,
}: {
  table: Table<T>;
}) {
  return (
    <TableBody items={table.getRowModel().rows}>
      {(row) => (
        <Row id={row.id} columns={row.getVisibleCells()}>
          {(cell) => (
            <Cell
              id={cell.id}
              className={
                cell.column.columnDef.id == 'selection'
                  ? 'sticky left-0 z-10 bg-white dark:bg-black'
                  : ''
              }
            >
              <TurboTableCell row={row} cell={cell} />
            </Cell>
          )}
        </Row>
      )}
    </TableBody>
  );
}
