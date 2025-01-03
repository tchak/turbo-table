import type { Table, RowData } from '@tanstack/react-table';
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

import { Link } from '~/components/ui/link';

export function TurboPagination<T extends RowData>({
  table,
}: {
  table: Table<T>;
}) {
  return (
    <div className="flex justify-between items-center px-2">
      <div>
        {`Total pages: ${
          table.getState().pagination.pageIndex + 1
        } / ${table.getPageCount()}`}
      </div>
      <div className="flex items-center">
        <Link
          variant="link"
          onPress={() => table.firstPage()}
          isDisabled={!table.getCanPreviousPage()}
        >
          <ChevronFirstIcon />
        </Link>
        <Link
          variant="link"
          onPress={() => table.previousPage()}
          isDisabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon />
        </Link>
        <Link
          variant="link"
          onPress={() => table.nextPage()}
          isDisabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon />
        </Link>
        <Link
          variant="link"
          onPress={() => table.lastPage()}
          isDisabled={!table.getCanNextPage()}
        >
          <ChevronLastIcon />
        </Link>
      </div>
      <div>Total rows: {table.getRowCount()}</div>
    </div>
  );
}
