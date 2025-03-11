import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateDishReqBody {
  name: string
  price: number
  description: string
  image?: string
  status: string
}

export interface GetDishParam extends ParamsDictionary {
  dishId: string
}

export interface UpdateDishParam extends ParamsDictionary {
  dishId: string
}

export interface DeleteDishParam extends ParamsDictionary {
  dishId: string
}

export interface UpdateDishReqBody {
  name?: string
  price?: number
  description?: string
  image?: string
  status?: string
}

// name: z.string().min(1).max(256),
// price: z.coerce.number().positive(),
// description: z.string().max(10000),
// image: z.string().url(),
// status: z.enum(DishStatusValues).optional()
