import { ObjectId } from 'mongodb'
import { CreateDishReqBody, UpdateDishReqBody } from '~/models/requests/Dishes.request'
import Dish from '~/models/schemas/Dish.schema'
import databaseService from '~/services/databases.service'

class DishesService {
  async getDishes() {
    const result = await databaseService.dishes.find().toArray()
    console.log(result)
    return result
  }

  async createDish(payload: CreateDishReqBody) {
    const result = await databaseService.dishes.insertOne(
      new Dish({
        name: payload.name,
        price: payload.price,
        image: payload.image,
        description: payload.description,
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
      { $set: payload, $currentDate: { updated_at: true } },
      { returnDocument: 'after' }
    )
    return result
  }

  async deleteDish(dishId: string) {
    const result = await databaseService.dishes.deleteOne({ _id: new ObjectId(dishId) })
    return result
  }
}

const dishesService = new DishesService()
export { dishesService }
