import { ArrowUpDown } from 'lucide-react';
import {
  Cell as AriaCell,
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  ResizableTableContainer as AriaResizableTableContainer,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  type CellProps,
  ColumnResizer,
  composeRenderProps,
  Group,
  type RowProps,
  type TableBodyProps,
  type TableHeaderProps,
  type TableProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';

const ResizableTableContainer = AriaResizableTableContainer;

const Table = ({ className, ...props }: TableProps) => (
  <AriaTable
    className={composeRenderProps(className, (className) =>
      cn(
        'w-full caption-bottom text-sm -outline-offset-2 data-[focus-visible]:outline-ring',
        className
      )
    )}
    {...props}
  />
);

const TableHeader = <T extends object>({
  className,
  ...props
}: TableHeaderProps<T>) => (
  <AriaTableHeader
    className={composeRenderProps(className, (className) =>
      cn('[&_tr]:border-b', className)
    )}
    {...props}
  />
);

export interface ColumnProps extends AriaColumnProps {
  isResizable?: boolean;
}

const Column = ({ className, children, ...props }: ColumnProps) => (
  <AriaColumn
    className={composeRenderProps(className, (className) =>
      cn(
        'h-12 text-left align-middle font-medium text-neutral-500 -outline-offset-2 data-[focus-visible]:outline-ring dark:text-neutral-400',
        className
      )
    )}
    {...props}
  >
    {composeRenderProps(children, (children, { allowsSorting }) => (
      <div className="flex items-center">
        <Group
          role="presentation"
          tabIndex={-1}
          className={cn(
            'flex h-10 flex-1 items-center gap-1 overflow-hidden rounded-md px-4',
            allowsSorting &&
              'p-2 data-[hovered]:bg-neutral-100 data-[hovered]:text-neutral-900 dark:data-[hovered]:bg-neutral-800 dark:data-[hovered]:text-neutral-50',
            'focus-visible:outline-none  data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-ring [&:has([slot=selection])]:pr-0'
          )}
        >
          <span className="truncate">{children}</span>
          {allowsSorting && <ArrowUpDown className="ml-2 size-4" />}
        </Group>
        {props.isResizable && (
          <ColumnResizer className="data-[focus-visible]:ring-rin box-content h-5 w-px translate-x-[8px] cursor-col-resize rounded bg-neutral-500 bg-clip-content px-[8px]  py-1 focus-visible:outline-none data-[resizing]:w-[2px] data-[resizing]:bg-neutral-900 data-[resizing]:pl-[7px] data-[focus-visible]:ring-1 data-[focus-visible]:ring-neutral-950 dark:bg-neutral-400 dark:data-[resizing]:bg-neutral-50 dark:data-[focus-visible]:ring-neutral-300" />
        )}
      </div>
    ))}
  </AriaColumn>
);

const TableBody = <T extends object>({
  className,
  ...props
}: TableBodyProps<T>) => (
  <AriaTableBody
    className={composeRenderProps(className, (className) =>
      cn(
        '-outline-offset-2 data-[empty]:h-24 data-[empty]:text-center data-[focus-visible]:outline-ring [&_tr:last-child]:border-0',
        className
      )
    )}
    {...props}
  />
);

const Row = <T extends object>({ className, ...props }: RowProps<T>) => (
  <AriaRow
    className={composeRenderProps(className, (className) =>
      cn(
        'border-b -outline-offset-2 transition-colors data-[hovered]:bg-neutral-100/50 data-[selected]:bg-neutral-100 data-[focus-visible]:outline-ring dark:data-[hovered]:bg-neutral-800/50 dark:data-[selected]:bg-neutral-800',
        className
      )
    )}
    {...props}
  />
);

const Cell = ({ className, ...props }: CellProps) => (
  <AriaCell
    className={composeRenderProps(className, (className) =>
      cn(
        'p-4 align-middle -outline-offset-2 data-[focus-visible]:outline-ring [&:has([role=checkbox])]:pr-0 truncate',
        className
      )
    )}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  ResizableTableContainer,
};
