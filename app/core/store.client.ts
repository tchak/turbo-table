import { forget, remember } from '@epic-web/remember';
import {
  deleteDB,
  openDB,
  type DBSchema,
  type StoreKey,
  type StoreNames,
  type StoreValue,
} from 'idb';
import * as R from 'remeda';
import * as Task from 'true-myth/task';

import { createActionResult, createActionTask } from '~/lib/action';
import type { Column, Row, Table, Value, View } from './schema';

export function importTable(file: File) {
  return readFile(file)
    .andThen(parseSheet)
    .andThen((result) =>
      createTable({
        name: result.title || file.name,
        columns: result.columns,
        data: result.data,
      })
    );
}

export function createTable({
  name,
  columns,
  data,
}: {
  name: string;
  columns: Column[];
  data?: Row['data'][];
}) {
  const createdAt = new Date();
  const view: View = {
    pageSize: 25,
    columnSizing: {},
    columnVisibility: {},
  };
  const table: Table = {
    id: crypto.randomUUID(),
    name,
    columns,
    view,
    createdAt,
    updatedAt: createdAt,
  };
  const rows: Row[] = (data ?? []).map((data) => ({
    id: crypto.randomUUID(),
    createdAt,
    updatedAt: createdAt,
    data,
  }));
  return createActionTask(
    (async () => {
      await getStore<TableStore>('tables').setItem(table);
      const store = getStore<RowStore>('rows', tableKey(table.id));
      for (const row of rows) {
        await store.setItem(row);
      }
      return table.id;
    })(),
    'Failed to import table'
  );
}

export function getTable(tableId: string): Promise<Table | undefined> {
  return getStore<TableStore>('tables').getItem(tableId);
}

export async function getTables(): Promise<Table[]> {
  const tables = await getStore<TableStore>('tables').getAll();
  return R.sortBy(tables, [R.prop('createdAt'), 'desc']);
}

export function deleteTable(tableId: string) {
  return createActionTask(
    (async () => {
      await getStore<TableStore>('tables').removeItem(tableId);
      await getStore<RowStore>('rows', tableKey(tableId)).destroy();
    })(),
    'Failed to delete table'
  );
}

export function updateView(tableId: string, view: View) {
  return createActionTask(
    (async () => {
      const table = await getTable(tableId);
      if (table) {
        await getStore<TableStore>('tables').setItem({ ...table, view });
      }
    })(),
    'Failed to update view'
  );
}

export function getRow(
  tableId: string,
  rowId: string
): Promise<Row | undefined> {
  return getStore<RowStore>('rows', tableKey(tableId)).getItem(rowId);
}

export function getRows(tableId: string): Promise<Row[]> {
  return getStore<RowStore>('rows', tableKey(tableId)).getAll();
}

export async function updateCell(
  tableId: string,
  rowId: string,
  columnId: string,
  value: Value
): Promise<void> {
  const store = getStore<RowStore>('rows', tableKey(tableId));
  const row = await store.getItem(rowId);
  if (row) {
    row.updatedAt = new Date();
    row.data[columnId] = value;
    await getStore<RowStore>('rows', tableKey(tableId)).setItem(row);
  }
}

export function deleteRow(tableId: string, rowId: string): Promise<void> {
  return getStore<RowStore>('rows', tableKey(tableId)).removeItem(rowId);
}

function getStore<Schema extends DBSchema>(
  name: StoreNames<Schema>,
  key?: string
) {
  const namespace = `${key ?? name}-store`;
  return remember(namespace, () => createStore(name, namespace));
}

interface TableStore extends DBSchema {
  tables: {
    key: string;
    value: Table;
  };
}

interface RowStore extends DBSchema {
  rows: {
    key: string;
    value: Row;
  };
}

function createStore<Schema extends DBSchema>(
  name: StoreNames<Schema>,
  namespace: string
) {
  const db = openDB<Schema>(namespace, 1, {
    upgrade(db) {
      db.createObjectStore(name, { keyPath: 'id' });
    },
  });
  const close = () => db.then((db) => db.close());
  return {
    async getAll() {
      return (await db).getAll(name);
    },
    async keys() {
      return (await db).getAllKeys(name);
    },
    async getItem(id: StoreKey<Schema, typeof name>) {
      return (await db).get(name, id);
    },
    async setItem(item: StoreValue<Schema, typeof name>) {
      return (await db).put(name, item);
    },
    async removeItem(id: StoreKey<Schema, typeof name>) {
      return (await db).delete(name, id);
    },
    async clear() {
      return (await db).clear(name);
    },
    async close() {
      return close();
    },
    async destroy() {
      await close();
      await deleteDB(namespace, {
        blocked: (currentVersion, event) => {
          console.error(currentVersion, event);
        },
      });
      forget(namespace);
    },
  };
}

function tableKey(id: string) {
  return `table/${id}`;
}

function parseSheet(input: string | ArrayBuffer) {
  return createActionTask(
    import('./sheet'),
    'Failed to import SheetJS'
  ).andThen(({ read }) =>
    Task.Task.fromResult(
      createActionResult(() => read(input), 'Failed to parse sheet')
    )
  );
}

function readFile(file: File) {
  const promise: Promise<string | ArrayBuffer> =
    file.type == 'text/csv' ? file.text() : file.arrayBuffer();
  return createActionTask(promise, 'Failed to read file');
}
