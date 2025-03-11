import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { DISHES_MESSAGE } from '~/constants/messages'
import {
  CreateDishReqBody,
  DeleteDishParam,
  GetDishParam,
  UpdateDishParam,
  UpdateDishReqBody
} from '~/models/requests/Dishes.request'
import {
  CreateDishResponse,
  DeleteDishResponse,
  GetDishesResponse,
  GetDishResponse,
  UpdateDishResponse
} from '~/models/response/Dishes.response'
import { dishesService } from '~/services/dishes.service'

export const getDishesController = async (req: Request<ParamsDictionary, GetDishesResponse>, res: Response) => {
  const result = await dishesService.getDishes()
  res.json({
    message: DISHES_MESSAGE.DISHES_FETCHED,
    result: result
  })
}

export const getDishController = async (req: Request<GetDishParam, GetDishResponse>, res: Response) => {
  const result = req.dish
  res.json({
    message: DISHES_MESSAGE.DISH_FETCHED,
    result: result
  })
}

export const createDishController = async (
  req: Request<ParamsDictionary, CreateDishResponse, CreateDishReqBody>,
  res: Response
) => {
  const result = await dishesService.createDish(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: DISHES_MESSAGE.DISH_CREATED,
    result: result
  })
}

export const updateDishController = async (
  req: Request<UpdateDishParam, UpdateDishResponse, UpdateDishReqBody>,
  res: Response
) => {
  const result = await dishesService.updateDish(req.params.dishId, req.body)
  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: DISHES_MESSAGE.DISH_NOT_FOUND
    })
    return
  }
  res.json({
    message: DISHES_MESSAGE.DISH_UPDATED,
    result: result
  })
}

export const deleteDishController = async (req: Request<DeleteDishParam, DeleteDishResponse>, res: Response) => {
  const result = await dishesService.deleteDish(req.params.dishId)
  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: DISHES_MESSAGE.DISH_NOT_FOUND
    })
    return
  }
  res.json({
    message: DISHES_MESSAGE.DISH_DELETED
  })
}
