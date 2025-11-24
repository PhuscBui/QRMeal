import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { DISHES_MESSAGE } from '~/constants/messages'
import {
  CreateDishReqBody,
  DeleteDishParam,
  GetDishParam,
  ImageSearchReqBody,
  UpdateDishParam,
  UpdateDishReqBody
} from '~/models/requests/Dishes.request'
import dishesService from '~/services/dishes.service'

export const getDishesController = async (req: Request<ParamsDictionary>, res: Response) => {
  const result = await dishesService.getDishes()
  res.json({
    message: DISHES_MESSAGE.DISHES_FETCHED,
    result: result
  })
}

export const getDishController = async (req: Request<GetDishParam>, res: Response) => {
  const result = req.dish
  res.json({
    message: DISHES_MESSAGE.DISH_FETCHED,
    result: result
  })
}

export const createDishController = async (
  req: Request<ParamsDictionary, unknown, CreateDishReqBody>,
  res: Response
) => {
  const result = await dishesService.createDish(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: DISHES_MESSAGE.DISH_CREATED,
    result: result
  })
}

export const updateDishController = async (
  req: Request<UpdateDishParam, unknown, UpdateDishReqBody>,
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

export const deleteDishController = async (req: Request<DeleteDishParam>, res: Response) => {
  const result = await dishesService.deleteDish(req.params.dishId)
  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: DISHES_MESSAGE.DISH_NOT_FOUND
    })
    return
  }
  res.json({
    message: DISHES_MESSAGE.DISH_DELETED,
    result: result
  })
}

export const imageSearchController = async (
  req: Request<ParamsDictionary, unknown, ImageSearchReqBody>,
  res: Response
) => {
  const { image_url, image_base64, maxResults } = req.body

  const result = await dishesService.searchDishByImage({
    image_url,
    image_base64,
    maxResults
  })

  res.json({
    message: DISHES_MESSAGE.DISH_IMAGE_SEARCH_SUCCESS,
    result
  })
}
