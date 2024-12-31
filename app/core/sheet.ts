import * as XLSX from 'xlsx';

import type { Column, Row, Value } from './schema';

export function read(input: string | ArrayBuffer): ParserResult {
  const workbook = XLSX.read(input, {
    type: typeof input == 'string' ? 'string' : 'buffer',
    sheets: 0,
    cellFormula: false,
    cellDates: true,
    cellNF: true,
    dense: true,
  });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<Row['data']>(sheet, {});
  const title = workbook.Props?.Title;
  const headers = sheet['!data']?.at(0) ?? [];
  const row1 = sheet['!data']?.at(1) ?? [];

  const typeMap = Object.fromEntries(
    headers.map((header, index) => {
      const name = header.w!;
      const cell = row1.at(index);
      if (!cell) {
        return [name, 's' as const];
      }
      if (cell.t == 's') {
        const date = new Date(cell.w!);
        if (isValidDate(date)) {
          return [name, 'd' as const];
        } else if (isBooleanString(cell.w!)) {
          return [name, 'b' as const];
        }
      }
      return [name, cell.t];
    })
  );
  const columns: Column[] = headers.map((header) => {
    const name = header.w!;
    return {
      id: crypto.randomUUID(),
      name,
      type: toColumnType(typeMap[name]),
    };
  });

  const idMap = Object.fromEntries(
    columns.map((column) => [column.name, column.id])
  );
  const transformMap = Object.fromEntries(
    columns.map((column) => {
      switch (typeMap[column.name]) {
        case 'b':
          return [column.name, parseBoolean];
        case 'n':
          return [column.name, parseNumber];
        case 'd':
          return [column.name, parseDate];
        case 's':
          return [column.name, parseString];
        case 'z':
        case 'e':
          return [column.name, parseNull];
      }
    })
  );

  return {
    title,
    columns,
    data: data.map((data) =>
      Object.fromEntries(
        Object.entries(data).map(([name, value]) => [
          idMap[name],
          transformMap[name](value),
        ])
      )
    ),
  };
}

type ParserResult = {
  title?: string;
  columns: Column[];
  data: Row['data'][];
};

function toColumnType(t: XLSX.ExcelDataType): Column['type'] {
  switch (t) {
    case 'b':
      return 'boolean';
    case 'n':
      return 'number';
    case 'd':
      return 'date';
    default:
      return 'string';
  }
}

function parseNumber(value: Value): number | null {
  if (isValidNumber(value)) {
    return value;
  }
  return null;
}

function parseBoolean(value: Value): boolean {
  if (value == true) {
    return true;
  } else if (value == 'string' && BOOLEAN_TRUE_VALUE.has(value)) {
    return true;
  }
  return false;
}

function parseDate(value: Value): Date | null {
  if (isValidDate(value)) {
    return value;
  } else if (typeof value == 'string') {
    const date = new Date(value);
    if (isValidDate(date)) {
      return date;
    }
  }
  return null;
}

function parseString(value: Value): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

function parseNull(_: Value): null {
  return null;
}

function isValidNumber(value: Value): value is number {
  return typeof value == 'number' && !isNaN(value);
}

function isValidDate(value: Value): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

function isBooleanString(value: string) {
  return BOOLEAN_TRUE_VALUE.has(value) || BOOLEAN_FALSE_VALUE.has(value);
}

const BOOLEAN_TRUE_VALUE = new Set([
  'true',
  'True',
  'TRUE',
  'yes',
  'Yes',
  'YES',
  'Oui',
  'oui',
  'OUI',
  'on',
  'y',
  't',
]);

const BOOLEAN_FALSE_VALUE = new Set([
  'false',
  'False',
  'FALSE',
  'no',
  'No',
  'NO',
  'Non',
  'non',
  'NON',
  'off',
  'n',
  'f',
]);
