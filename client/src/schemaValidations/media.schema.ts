import z from "zod";

export const UploadImageRes = z.object({
  message: z.string(),
  result: z.string(),
});

export type UploadImageResType = z.TypeOf<typeof UploadImageRes>;
