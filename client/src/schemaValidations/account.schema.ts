import { RoleValues } from "@/constants/type";
import z from "zod";

export const AccountSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  avatar: z.string().nullable(),
  date_of_birth: z.date().nullable(),
});

export type AccountType = z.TypeOf<typeof AccountSchema>;

export const AccountListRes = z.object({
  result: z.array(AccountSchema),
  message: z.string(),
});

export type AccountListResType = z.TypeOf<typeof AccountListRes>;

export const AccountRes = z
  .object({
    result: AccountSchema,
    message: z.string(),
  })
  .strict();

export type AccountResType = z.TypeOf<typeof AccountRes>;

export const CreateEmployeeAccountBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    email: z.string().email(),
    avatar: z.string().url().optional(),
    date_of_birth: z.date(),
    password: z.string().min(6).max(100),
    confirm_password: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu không khớp",
        path: ["confirm_password"],
      });
    }
  });

export type CreateEmployeeAccountBodyType = z.TypeOf<
  typeof CreateEmployeeAccountBody
>;

export const UpdateEmployeeAccountBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    email: z.string().email(),
    avatar: z.string().url().optional(),
    date_of_birth: z.date().optional(),
    change_password: z.boolean().optional(),
    password: z.string().min(6).max(100).optional(),
    confirm_password: z.string().min(6).max(100).optional(),
  })
  .strict()
  .superRefine(({ confirm_password, password, change_password }, ctx) => {
    if (change_password) {
      if (!password || !confirm_password) {
        ctx.addIssue({
          code: "custom",
          message: "Hãy nhập mật khẩu mới và xác nhận mật khẩu mới",
          path: ["change_password"],
        });
      } else if (confirm_password !== password) {
        ctx.addIssue({
          code: "custom",
          message: "Mật khẩu không khớp",
          path: ["confirm_password"],
        });
      }
    }
  });

export type UpdateEmployeeAccountBodyType = z.TypeOf<
  typeof UpdateEmployeeAccountBody
>;

export const UpdateMeBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    avatar: z.string().url().optional(),
    date_of_birth: z.date().optional(),
  })
  .strict();

export type UpdateMeBodyType = z.TypeOf<typeof UpdateMeBody>;

export const ChangePasswordBody = z
  .object({
    old_password: z.string().min(6).max(100),
    password: z.string().min(6).max(100),
    confirm_password: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Password does not match",
        path: ["confirm_password"],
      });
    }
  });

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>;

export const AccountIdParam = z.object({
  _id: z.string(),
});

export type AccountIdParamType = z.TypeOf<typeof AccountIdParam>;

export const GetListGuestsRes = z.object({
  result: z.array(
    z.object({
      _id: z.string(),
      name: z.string(),
      table_number: z.number().nullable(),
      created_at: z.date(),
      updated_at: z.date(),
    })
  ),
  message: z.string(),
});

export type GetListGuestsResType = z.TypeOf<typeof GetListGuestsRes>;

export const GetGuestListQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type GetGuestListQueryParamsType = z.TypeOf<
  typeof GetGuestListQueryParams
>;

export const CreateGuestBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    phone: z.string().min(10).max(11),
    table_number: z.number(),
  })
  .strict();

export type CreateGuestBodyType = z.TypeOf<typeof CreateGuestBody>;

export const CreateGuestRes = z.object({
  message: z.string(),
  result: z.object({
    _id: z.string(),
    name: z.string(),
    phone: z.string().min(10).max(11),
    role: z.enum(RoleValues),
    table_number: z.number().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  }),
});

export type CreateGuestResType = z.TypeOf<typeof CreateGuestRes>;
