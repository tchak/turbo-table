import type {
  ColumnSizingState,
  RowData,
  SortingState,
  Table,
  TableState,
  DisplayColumnDef,
} from '@tanstack/react-table';
import type {
  ResizableTableContainerProps,
  Selection,
  SortDescriptor,
} from 'react-aria-components';
import { useDateFormatter, useNumberFormatter } from 'react-aria';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

import { Checkbox } from '~/components/ui/checkbox';
import type { Column, Row, View } from './turbo-table';
import { getCellRenderer } from './cell';

export function useTurboTable({
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
  const [autoResetPageIndex] = useSkipper();

  const table = useReactTable({
    autoResetPageIndex,
    columns: useColumns(columns),
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    defaultColumn: {
      size: 200,
      minSize: 100,
      maxSize: 500,
    },
    groupedColumnMode: false,
    ...useTableState(view, onChange),
  });

  const { selectedKeys, onSelectionChange } = useRowSelectionState(table);
  const { sortDescriptor, onSortChange } = useSortState(table);
  const { onResize } = useColumnSizingState(table);

  return {
    table,
    selectedKeys,
    onSelectionChange,
    sortDescriptor,
    onSortChange,
    onResize,
  };
}

function useSkipper() {
  const shouldSkipRef = useRef(false);
  const shouldSkip = shouldSkipRef.current;

  const skip = useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

function useRowSelectionState<T extends RowData>(table: Table<T>) {
  const selectedKeys = useMemo<Selection>(() => {
    if (table.getIsAllRowsSelected()) {
      return 'all';
    }
    return new Set(
      Object.entries(table.getState().rowSelection)
        .filter(([, selected]) => selected)
        .map(([key]) => key)
    );
  }, [table.getState().rowSelection]);
  const onSelectionChange = useCallback<(keys: Selection) => void>(
    (keys) => {
      if (keys == 'all') {
        table.toggleAllRowsSelected(true);
      } else if (keys.size == 0) {
        table.resetRowSelection(true);
      } else {
        const rowIds = Array.from(keys).map(String);
        const rowSelection = Object.fromEntries(
          rowIds.map((key) => [key, true])
        );
        table.setRowSelection(rowSelection);
      }
    },
    [table]
  );

  return { selectedKeys, onSelectionChange };
}

function useSortState<T extends RowData>(table: Table<T>) {
  const sortDescriptor = useMemo(
    () => sortingStateToSortDescriptior(table.getState().sorting),
    [table.getState().sorting]
  );
  const onSortChange = useCallback<(descriptor: SortDescriptor) => void>(
    (descriptor) => {
      table.setSorting(sortDescriptiorToSortingState(descriptor));
    },
    []
  );

  return { sortDescriptor, onSortChange };
}

function useColumnSizingState<T extends RowData>(table: Table<T>) {
  const onResize = useCallback<
    NonNullable<ResizableTableContainerProps['onResize']>
  >((widths) => {
    const columnSizing: ColumnSizingState = {};
    for (const [columnId, size] of widths) {
      if (columnId != SELECTION_COLUMN && typeof size == 'number') {
        columnSizing[String(columnId)] = size;
      }
    }
    table.setColumnSizing(columnSizing);
  }, []);

  return { onResize };
}

const columnHelper = createColumnHelper<Row>();

const SELECTION_COLUMN = 'selection';
const SELECTION_COLUMN_DEF: DisplayColumnDef<Row> = {
  id: SELECTION_COLUMN,
  header: () => <Checkbox slot={SELECTION_COLUMN} />,
  cell: () => <Checkbox slot={SELECTION_COLUMN} />,
  size: 52,
  minSize: 52,
  enableResizing: false,
  enableHiding: false,
  enableGrouping: false,
};

function useColumns(columns: Column[]) {
  const dateFormatter = useDateFormatter();
  const numberFormatter = useNumberFormatter();

  return useMemo(
    () => [
      columnHelper.display(SELECTION_COLUMN_DEF),
      ...columns.map((column) =>
        columnHelper.accessor((row) => row.data[column.id] ?? null, {
          id: column.id,
          header: column.name,
          cell: getCellRenderer(column, {
            date: dateFormatter,
            number: numberFormatter,
          }),
          enableGrouping: column.type == 'string',
        })
      ),
    ],
    [columns]
  );
}

type State = Pick<
  TableState,
  'sorting' | 'grouping' | 'pagination' | 'columnVisibility' | 'columnSizing'
>;

function useTableState(view: View, onChange?: (view: View) => void) {
  const initialState = useMemo(() => viewStateToTableState(view), [view]);
  const [sorting, onSortingChange] = useState(() => initialState.sorting);
  const [grouping, onGroupingChange] = useState(() => initialState.grouping);
  const [pagination, onPaginationChange] = useState(
    () => initialState.pagination
  );
  const [columnVisibility, onColumnVisibilityChange] = useState(
    () => initialState.columnVisibility
  );
  const [columnSizing, onColumnSizingChange] = useState(
    () => initialState.columnSizing
  );
  const state = useMemo<State>(
    () => ({
      sorting,
      grouping,
      pagination,
      columnVisibility,
      columnSizing,
    }),
    [sorting, grouping, pagination, columnVisibility, columnSizing]
  );
  const lastState = useRef(state);

  useEffect(() => {
    if (!isEqual(lastState.current, state)) {
      lastState.current = state;
      onChange?.(tableStateToViewState(state));
    }
  }, [state]);

  return {
    state,
    onSortingChange,
    onGroupingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    onColumnSizingChange,
  };
}

function viewStateToTableState(view: View): State {
  delete view.columnSizing[SELECTION_COLUMN];
  return {
    sorting: view.sort ? [view.sort] : [],
    grouping: view.group ? [view.group] : [],
    pagination: {
      pageSize: view.pageSize,
      pageIndex: 0,
    },
    columnVisibility: view.columnVisibility,
    columnSizing: view.columnSizing,
  };
}

function tableStateToViewState({
  sorting,
  grouping,
  pagination,
  columnVisibility,
  columnSizing,
}: State): View {
  return {
    sort: sorting.at(0),
    group: grouping.at(0),
    pageSize: pagination.pageSize,
    columnVisibility,
    columnSizing,
  };
}

function sortDescriptiorToSortingState(
  descriptor?: SortDescriptor | null
): SortingState {
  if (descriptor) {
    return [
      {
        id: String(descriptor.column),
        desc: descriptor.direction == 'descending',
      },
    ];
  }
  return [];
}

function sortingStateToSortDescriptior(
  sorting: SortingState
): SortDescriptor | undefined {
  const descriptor = sorting.at(0);
  if (descriptor) {
    return {
      column: descriptor.id,
      direction: descriptor.desc ? 'descending' : 'ascending',
    };
  }
  return;
}
