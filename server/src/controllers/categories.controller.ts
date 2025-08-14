import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORIES_MESSAGE } from '~/constants/messages'
import {
  CreateCategoryReqBody,
  DeleteCategoryParam,
  GetCategoryParam,
  UpdateCategoryReqBody
} from '~/models/requests/Category.request'
import {
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoriesWithDishCountResponse,
  GetCategoryResponse,
  UpdateCategoryResponse
} from '~/models/response/Category.response'
import categoryService from '~/services/categories.service'

export const getCategoriesController = async (
  req: Request<ParamsDictionary, GetCategoriesWithDishCountResponse>,
  res: Response
) => {
  const categories = await categoryService.getAllCategories()
  res.json({
    message: CATEGORIES_MESSAGE.CATEGORIES_FETCHED,
    result: categories
  })
}

export const getCategoryController = async (req: Request<GetCategoryParam, GetCategoryResponse>, res: Response) => {
  const result = req.category

  res.json({
    message: CATEGORIES_MESSAGE.CATEGORY_FETCHED,
    result: result
  })
}

export const createCategoryController = async (
  req: Request<ParamsDictionary, CreateCategoryResponse, CreateCategoryReqBody>,
  res: Response
) => {
  const categoryData = req.body
  const newCategory = await categoryService.createCategory(categoryData)

  res.status(HTTP_STATUS.CREATED).json({
    message: CATEGORIES_MESSAGE.CATEGORY_CREATED,
    result: newCategory
  })
}

export const updateCategoryController = async (
  req: Request<GetCategoryParam, UpdateCategoryResponse, UpdateCategoryReqBody>,
  res: Response
) => {
  const { categoryId } = req.params
  const categoryData = req.body
  const updatedCategory = await categoryService.updateCategory(categoryId, categoryData)

  res.json({
    message: CATEGORIES_MESSAGE.CATEGORY_UPDATED,
    result: updatedCategory
  })
}

export const deleteCategoryController = async (
  req: Request<DeleteCategoryParam, DeleteCategoryResponse>,
  res: Response
) => {
  const { categoryId } = req.params
  await categoryService.deleteCategory(categoryId)

  res.json({
    message: CATEGORIES_MESSAGE.CATEGORY_DELETED
  })
}
