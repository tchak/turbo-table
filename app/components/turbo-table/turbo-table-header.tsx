import type { Table, RowData } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { TableHeader, Column } from '~/components/ui/table';

export function TurboTableHeader<T extends RowData>({
  table,
}: {
  table: Table<T>;
}) {
  const [rerenderHeader, setRerenderHeader] = useState(0);
  useEffect(() => {
    setRerenderHeader((count) => count + 1);
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  return (
    <TableHeader
      columns={table.getLeafHeaders()}
      dependencies={[rerenderHeader]}
    >
      {(header) => (
        <Column
          id={header.id}
          isRowHeader
          allowsSorting={header.column.getCanSort()}
          isResizable={header.column.getCanResize()}
          width={header.column.getSize()}
          minWidth={header.column.columnDef.minSize}
          className={`sticky top-0 bg-gray-100/60 dark:bg-zinc-700/60 backdrop-blur-md ${
            header.id == 'selection' ? 'left-0 z-20' : 'z-10'
          }`}
        >
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </Column>
      )}
    </TableHeader>
  );
}
