import { z } from 'zod';

const ID = z.string().uuid();
const UnsignedInt = z.number().int().positive();

export const ColumnTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'date',
  'json',
]);
export type ColumnType = z.infer<typeof ColumnTypeSchema>;

export const ColumnSchema = z.object({
  id: ID,
  name: z.string(),
  type: ColumnTypeSchema,
});
export type Column = z.infer<typeof ColumnSchema>;

export const ViewSchema = z.object({
  sort: z.object({ id: ID, desc: z.boolean() }).optional(),
  group: ID.optional(),
  pageSize: UnsignedInt,
  columnSizing: z.record(ID, UnsignedInt),
  columnVisibility: z.record(ID, z.boolean()),
});
export type View = z.infer<typeof ViewSchema>;

export const TableSchema = z.object({
  id: ID,
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  columns: ColumnSchema.array(),
  view: ViewSchema,
});
export type Table = z.infer<typeof TableSchema>;

export const ValueSchema = z
  .union([z.string(), z.number(), z.boolean(), z.date()])
  .nullable();
export type Value = z.infer<typeof ValueSchema>;

export const RowSchema = z.object({
  id: ID,
  createdAt: z.date(),
  updatedAt: z.date(),
  data: z.record(ID, ValueSchema),
});
export type Row = z.infer<typeof RowSchema>;
