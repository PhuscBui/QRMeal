import { ObjectId } from 'mongodb'
import Category from '../models/schemas/Category.schema'
import databaseService from '~/services/databases.service'
import { CreateCategoryReqBody, UpdateCategoryReqBody } from '~/models/requests/Category.request'
import { ErrorWithStatus } from '~/models/Error'
import { CATEGORIES_MESSAGE } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class CategoryService {
  async createCategory(payload: CreateCategoryReqBody) {
    const data = new Category(payload)

    const existingCategory = await this.getCategoryByName(data.name)

    if (existingCategory) {
      throw new ErrorWithStatus({
        message: CATEGORIES_MESSAGE.CATEGORY_NAME_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const result = await databaseService.categories.insertOne(data)
    const category = await databaseService.categories.findOne({ _id: result.insertedId })
    return category
  }

  async getAllCategories() {
    const result = await databaseService.categories
      .aggregate([
        {
          $lookup: {
            from: 'dishes',
            localField: '_id',
            foreignField: 'category_id',
            as: 'dishes'
          }
        },
        {
          $addFields: {
            dish_count: { $size: '$dishes' }
          }
        },
        {
          $project: {
            dishes: 0
          }
        }
      ])
      .toArray()

    return result
  }

  async getCategoryById(id: string) {
    const category = await databaseService.categories.findOne({ _id: new ObjectId(id) })
    return category
  }

  async updateCategory(id: string, data: UpdateCategoryReqBody) {
    const updateData = { ...data, updated_at: new Date() }

    if (typeof data.name === 'string') {
      const existingCategory = await this.getCategoryByName(data.name)
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw new ErrorWithStatus({
          message: CATEGORIES_MESSAGE.CATEGORY_NAME_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }
    const result = await databaseService.categories.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.modifiedCount === 0) return null

    return this.getCategoryById(id)
  }

  async deleteCategory(id: string) {
    const categoryId = new ObjectId(id)

    const result = await databaseService.categories.deleteOne({ _id: categoryId })

    if (result.deletedCount > 0) {
      await databaseService.dishes.updateMany({ category_ids: categoryId }, { $pull: { category_ids: categoryId } })
    }

    return result.deletedCount > 0
  }

  async getCategoriesByIds(ids: string[]) {
    const objectIds = ids.map((id) => new ObjectId(id))
    const categories = await databaseService.categories.find({ _id: { $in: objectIds } }).toArray()
    return categories
  }

  async getCategoryByName(name: string) {
    const category = await databaseService.categories.findOne({ name })
    return category
  }

  async getCategoriesByNames(names: string[]) {
    const categories = await databaseService.categories.find({ name: { $in: names } }).toArray()
    return categories
  }
}

const categoryService = new CategoryService()
export default categoryService
