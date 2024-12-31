import type { Table, RowData } from '@tanstack/react-table';
import { EyeOffIcon, FilterIcon, ListCollapseIcon } from 'lucide-react';
import { Group } from 'react-aria-components';
import { useMemo } from 'react';

import { Toolbar } from '~/components/ui/toolbar';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Switch } from '~/components/ui/switch';
import { JollySelect as Select, SelectItem } from '~/components/ui/select';

export function TurboTableToolbar<T extends RowData>({
  table,
}: {
  table: Table<T>;
}) {
  const columns = table.getAllLeafColumns();
  const hiddenColumnsCount = useMemo(
    () => columns.filter((column) => !column.getIsVisible()).length,
    [columns, table.getState().columnVisibility]
  );

  return (
    <Toolbar orientation="horizontal" className="flex-shrink-0">
      <Group aria-label="Columns">
        <PopoverTrigger>
          <Button variant="outline">
            <EyeOffIcon className="h-5 w-5 mr-1" />
            {hiddenColumnsCount
              ? `${hiddenColumnsCount} hidden columns`
              : 'Hide columns'}
          </Button>
          <Popover>
            <PopoverDialog>
              <div className="flex flex-col gap-2">
                {columns
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <Switch
                      key={column.id}
                      isSelected={column.getIsVisible()}
                      onChange={() => column.toggleVisibility()}
                    >
                      <div className="indicator" />
                      {String(column.columnDef.header)}
                    </Switch>
                  ))}
              </div>
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>

        <PopoverTrigger>
          <Button variant="outline">
            <FilterIcon className="h-5 w-5 mr-1" />
            Filter
          </Button>
          <Popover>
            <PopoverDialog></PopoverDialog>
          </Popover>
        </PopoverTrigger>

        <PopoverTrigger>
          <Button variant="outline">
            <ListCollapseIcon className="h-5 w-5 mr-1" />
            Group
          </Button>
          <Popover>
            <PopoverDialog>
              <div className="flex flex-col gap-2">
                <Select
                  aria-label="Select group"
                  items={columns.filter((column) => column.getCanGroup())}
                  selectedKey={table.getState().grouping.at(0) ?? null}
                  onSelectionChange={(key) => {
                    table.setGrouping(key ? [String(key)] : []);
                  }}
                >
                  {(column) => (
                    <SelectItem id={column.columnDef.id}>
                      {String(column.columnDef.header)}
                    </SelectItem>
                  )}
                </Select>
                {table.getState().grouping.length ? (
                  <Button
                    variant="outline"
                    onPress={() => table.resetGrouping(true)}
                  >
                    Reset
                  </Button>
                ) : null}
              </div>
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </Group>
    </Toolbar>
  );
}
