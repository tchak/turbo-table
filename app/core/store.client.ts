import { forget, remember } from '@epic-web/remember';
import {
  deleteDB,
  openDB,
  type DBSchema,
  type StoreKey,
  type StoreNames,
  type StoreValue,
} from 'idb';

import type { Row, Table, Value, View } from './schema';

export async function importTable(file: File) {
  const read = await import('./sheet').then(({ read }) => read);
  const result = await file.text().then((text) => read(text));

  const view: View = {
    pageSize: 25,
    columnSizing: {},
    columnVisibility: {},
  };
  const createdAt = new Date();
  const table: Table = {
    id: crypto.randomUUID(),
    name: result.title ?? file.name,
    columns: result.columns,
    view,
    createdAt,
    updatedAt: createdAt,
  };
  const rows: Row[] = result.data.map((data) => ({
    id: crypto.randomUUID(),
    createdAt,
    updatedAt: createdAt,
    data,
  }));

  await getStore<TableStore>('tables').setItem(table);
  const store = getStore<RowStore>('rows', tableKey(table.id));
  for (const row of rows) {
    await store.setItem(row);
  }

  return table.id;
}

export function getTable(tableId: string): Promise<Table | undefined> {
  return getStore<TableStore>('tables').getItem(tableId);
}

export function getTables(): Promise<Table[]> {
  return getStore<TableStore>('tables').getAll();
}

export async function deleteTable(tableId: string): Promise<void> {
  await getStore<TableStore>('tables').removeItem(tableId);
  await getStore<RowStore>('rows', tableKey(tableId)).destroy();
}

export async function updateView(tableId: string, view: View): Promise<void> {
  const table = await getTable(tableId);
  if (table) {
    await getStore<TableStore>('tables').setItem({ ...table, view });
  }
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
