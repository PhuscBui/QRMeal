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
import categoryService from '~/services/categories.service'

export const getCategoriesController = async (req: Request<ParamsDictionary>, res: Response) => {
  const categories = await categoryService.getAllCategories()
  res.json({
    message: CATEGORIES_MESSAGE.CATEGORIES_FETCHED,
    result: categories
  })
}

export const getCategoryController = async (req: Request<GetCategoryParam>, res: Response) => {
  const result = req.category

  res.json({
    message: CATEGORIES_MESSAGE.CATEGORY_FETCHED,
    result: result
  })
}

export const createCategoryController = async (
  req: Request<ParamsDictionary, unknown, CreateCategoryReqBody>,
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
  req: Request<GetCategoryParam, unknown, UpdateCategoryReqBody>,
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

export const deleteCategoryController = async (req: Request<DeleteCategoryParam>, res: Response) => {
  const { categoryId } = req.params
  await categoryService.deleteCategory(categoryId)

  res.json({
    message: CATEGORIES_MESSAGE.CATEGORY_DELETED
  })
}
