import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateCategoryReqBody {
  name: string
  description?: string
}

export interface UpdateCategoryReqBody {
  name?: string
  description?: string
}

export interface GetCategoryParam extends ParamsDictionary {
  categoryId: string
}

export interface DeleteCategoryParam extends ParamsDictionary {
  categoryId: string
}
