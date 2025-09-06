import { ObjectId } from 'mongodb'
import { CreateDishReqBody, UpdateDishReqBody } from '~/models/requests/Dishes.request'
import Dish from '~/models/schemas/Dish.schema'
import databaseService from '~/services/databases.service'

class DishesService {
  async getDishes() {
    const dishes = await databaseService.dishes
      .aggregate([
        {
          $lookup: {
            from: 'dish_reviews',
            localField: '_id',
            foreignField: 'dish_id',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            avg_rating: { $avg: '$reviews.rating' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $addFields: {
            category_name: { $arrayElemAt: ['$category.name', 0] }
          }
        },
        {
          $project: {
            reviews: 0,
            category: 0
          }
        }
      ])
      .toArray()

    return dishes
  }

  async createDish(payload: CreateDishReqBody) {
    const result = await databaseService.dishes.insertOne(
      new Dish({
        name: payload.name,
        price: payload.price,
        image: payload.image,
        description: payload.description,
        category_id: new ObjectId(payload.category_id),
        status: payload.status
      })
    )
    const dish = await databaseService.dishes.findOne({ _id: result.insertedId })
    return dish
  }

  async getDish(dishId: string) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(dishId) })
    return dish
  }

  async updateDish(dishId: string, payload: UpdateDishReqBody) {
    const result = await databaseService.dishes.findOneAndUpdate(
      { _id: new ObjectId(dishId) },
      {
        $set: {
          name: payload.name,
          price: payload.price,
          image: payload.image,
          description: payload.description,
          category_id: new ObjectId(payload.category_id),
          status: payload.status
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    return result
  }

  async deleteDish(dishId: string) {
    const result = await databaseService.dishes.findOneAndDelete({ _id: new ObjectId(dishId) })
    return result
  }

  async getDishesByCategory(categoryId: string) {
    const dishes = await databaseService.dishes.find({ category_ids: { $in: [new ObjectId(categoryId)] } }).toArray()
    return dishes
  }
}

const dishesService = new DishesService()
export default dishesService
