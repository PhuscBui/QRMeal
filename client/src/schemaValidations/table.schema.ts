import { TableStatusValues } from "@/constants/type";
import z from "zod";

export const CreateTableBody = z.object({
  number: z.coerce.number().positive(),
  capacity: z.coerce.number().positive(),
  status: z.enum(TableStatusValues).optional(),
});

export type CreateTableBodyType = z.TypeOf<typeof CreateTableBody>;

export const TableSchema = z.object({
  _id: z.string(),
  number: z.coerce.number(),
  capacity: z.coerce.number(),
  status: z.enum(TableStatusValues),
  token: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const TableRes = z.object({
  result: TableSchema,
  message: z.string(),
});

export type TableResType = z.TypeOf<typeof TableRes>;

export const TableListRes = z.object({
  result: z.array(TableSchema),
  message: z.string(),
});

export type TableListResType = z.TypeOf<typeof TableListRes>;

export const UpdateTableBody = z.object({
  changeToken: z.boolean(),
  capacity: z.coerce.number().positive(),
  status: z.enum(TableStatusValues).optional(),
});
export type UpdateTableBodyType = z.TypeOf<typeof UpdateTableBody>;
export const TableParams = z.object({
  number: z.coerce.number(),
});
export type TableParamsType = z.TypeOf<typeof TableParams>;
