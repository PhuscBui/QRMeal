import { ObjectId } from 'mongodb'
import { CreateDishReqBody, ImageSearchReqBody, UpdateDishReqBody } from '~/models/requests/Dishes.request'
import Dish from '~/models/schemas/Dish.schema'
import ImageSearchLog from '~/models/schemas/ImageSearchLog.schema'
import databaseService from '~/services/databases.service'
import { detectDishLabels, expandKeywords } from '~/services/vision.service'

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

  async searchDishByImage({
    image_url,
    image_base64,
    maxResults = 5,
    guest_id
  }: ImageSearchReqBody & { guest_id?: ObjectId }) {
    if (!image_url && !image_base64) {
      throw new Error('Either image_url or image_base64 is required')
    }

    // Detect labels từ hình ảnh
    const annotations = await detectDishLabels(image_base64 ?? image_url ?? '')

    const rawKeywords = annotations
      .filter((label) => label.description != null)
      .map((label) => label.description!.toLowerCase())

    // Expand keywords với mapping tiếng Việt
    const expandedKeywords = expandKeywords(rawKeywords)

    if (expandedKeywords.length === 0) {
      return {
        dishes: [],
        labels: annotations,
        keywords: rawKeywords,
        expandedKeywords: []
      }
    }

    console.log('Raw keywords:', rawKeywords)
    console.log('Expanded keywords:', expandedKeywords)

    // Chiến lược 1: Tìm chính xác (exact match) - ưu tiên cao
    const exactMatches = await databaseService.dishes
      .find({
        $or: [
          { name: { $in: expandedKeywords.map((k) => new RegExp(`^${k}$`, 'i')) } },
          { name_en: { $in: expandedKeywords.map((k) => new RegExp(`^${k}$`, 'i')) } }
        ]
      })
      .limit(maxResults)
      .toArray()

    if (exactMatches.length >= maxResults) {
      return {
        dishes: exactMatches,
        labels: annotations,
        searchStrategy: 'exact_match',
        keywords: rawKeywords,
        expandedKeywords
      }
    }

    // Chiến lược 2: Tìm từng phần (partial match)
    const partialMatches = await databaseService.dishes
      .find({
        $or: [
          { name: { $in: expandedKeywords.map((k) => new RegExp(k, 'i')) } },
          { name_en: { $in: expandedKeywords.map((k) => new RegExp(k, 'i')) } },
          { description: { $in: expandedKeywords.map((k) => new RegExp(k, 'i')) } },
          { tags: { $in: expandedKeywords } },
          { category: { $in: expandedKeywords } }
        ]
      })
      .limit(maxResults * 2)
      .toArray()

    // Merge và loại trùng
    const allMatches = [...exactMatches, ...partialMatches]
    const uniqueDishes = Array.from(new Map(allMatches.map((dish) => [dish._id.toString(), dish])).values())

    // Sort theo relevance score
    const scoredDishes = uniqueDishes.map((dish) => {
      let score = 0
      const dishName = dish.name.toLowerCase()
      const dishNameEn = dish.name?.toLowerCase() || ''

      expandedKeywords.forEach((keyword) => {
        if (dishName === keyword || dishNameEn === keyword) score += 10
        else if (dishName.includes(keyword)) score += 5
        else if (dishNameEn.includes(keyword)) score += 5
        else if (dish.description?.includes(keyword)) score += 3
      })

      return { dish, score }
    })

    scoredDishes.sort((a, b) => b.score - a.score)
    const sortedDishes = scoredDishes.slice(0, maxResults).map((item) => item.dish)

    // Chiến lược 3: Text search nếu vẫn thiếu
    if (sortedDishes.length < maxResults) {
      try {
        const textSearchResults = await databaseService.dishes
          .find({
            $text: { $search: expandedKeywords.join(' ') }
          })
          .limit(maxResults - sortedDishes.length)
          .toArray()

        const existingIds = new Set(sortedDishes.map((d) => d._id.toString()))
        const newResults = textSearchResults.filter((dish) => !existingIds.has(dish._id.toString()))

        sortedDishes.push(...newResults)
      } catch (error) {
        console.log('Text search not available')
      }
    }

    return {
      dishes: sortedDishes,
      labels: annotations,
      searchStrategy: exactMatches.length > 0 ? 'mixed' : 'partial_match',
      keywords: rawKeywords,
      expandedKeywords
    }
  }
}

const dishesService = new DishesService()
export default dishesService
