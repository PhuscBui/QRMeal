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
  name: string
  price: number
  description: string
  image?: string
  status: string
}
