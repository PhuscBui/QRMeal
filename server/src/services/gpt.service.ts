import OpenAI from 'openai'
import { envConfig } from '~/config'
import dishService from './dishes.service'
import categoryService from './categories.service'
import tablesService from '~/services/tables.service'
import promotionsService from '~/services/promotions.service'
import { GetPromotionsQueryParams } from '~/models/requests/Promotion.request'

class GPTService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: envConfig.openaiApiKey
    })
  }

  async generateResponse(userMessage: string, sessionId: string): Promise<string> {
    try {
      // Lấy dữ liệu nhà hàng
      const restaurantData = await this.getRestaurantData()

      // Tạo prompt với context nhà hàng
      const systemPrompt = this.createSystemPrompt(restaurantData)

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      })

      const response = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.'
      console.log('GPT Service - Response generated:', response.substring(0, 100) + '...')

      return response
    } catch (error) {
      console.error('GPT Service Error:', error)
      return 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.'
    }
  }

  private async getRestaurantData() {
    try {
      const locationInfo = {
        time: new Date().toISOString(),
        location: 'Ho Chi Minh City, Vietnam'
      }
      const promotionsQuery: GetPromotionsQueryParams = {}
      const [dishesResult, categoriesResult, tablesResult, promotionsResult] = await Promise.all([
        dishService.getDishes(),
        categoryService.getAllCategories(),
        tablesService.getTables(),
        promotionsService.getPromotions(promotionsQuery)
      ])

      const dishes = Array.isArray(dishesResult) ? dishesResult : dishesResult || []
      const categories = Array.isArray(categoriesResult) ? categoriesResult : categoriesResult || []

      return {
        dishes: dishes || [],
        categories: categories || [],
        tables: tablesResult || [],
        promotions: promotionsResult || [],
        restaurantInfo: {
          name: 'QRMeal Restaurant',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          phone: '0123-456-789',
          hours: '8:00 - 22:00',
          description: 'Nhà hàng chuyên phục vụ các món ăn Việt Nam và quốc tế',
          locationInfo: { ...locationInfo }
        }
      }
    } catch (error) {
      console.error('Error getting restaurant data:', error)
      return {
        dishes: [],
        categories: [],
        restaurantInfo: {
          name: 'QRMeal Restaurant',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          phone: '0123-456-789',
          hours: '8:00 - 22:00',
          description: 'Nhà hàng chuyên phục vụ các món ăn Việt Nam và quốc tế'
        }
      }
    }
  }

  private createSystemPrompt(restaurantData: any): string {
    const { dishes, categories, restaurantInfo } = restaurantData

    let menuInfo = ''
    if (dishes.length > 0 && categories.length > 0) {
      menuInfo = 'THỰC ĐƠN:\n'
      categories.forEach((category: any) => {
        menuInfo += `\n${category.name}:\n`
        const categoryDishes = dishes.filter((dish: any) => dish.category_id?.toString() === category._id?.toString())
        if (categoryDishes.length > 0) {
          categoryDishes.forEach((dish: any) => {
            menuInfo += `- ${dish.name}: ${dish.price?.toLocaleString('vi-VN')}đ`
            if (dish.description) {
              menuInfo += ` (${dish.description})`
            }
            menuInfo += '\n'
          })
        } else {
          menuInfo += `- Chưa có món nào trong danh mục này\n`
        }
      })
      menuInfo += '\nKHU VỰC BÀN:\n'
      if (restaurantData.tables.length > 0) {
        restaurantData.tables.forEach((table: any) => {
          menuInfo += `- Bàn ${table.name}: Sức chứa ${table.capacity} người\n`
        })
      } else {
        menuInfo += '- Hiện tại chưa có thông tin bàn\n'
      }

      menuInfo += '\nKHUYẾN MÃI:\n'
      if (restaurantData.promotions.length > 0) {
        restaurantData.promotions.forEach((promotion: any) => {
          menuInfo += `- ${promotion.title}: ${promotion.description}\n`
        })
      } else {
        menuInfo += '- Hiện tại chưa có khuyến mãi nào\n'
      }
    } else {
      menuInfo =
        'THỰC ĐƠN:\nHiện tại chưa có thông tin thực đơn chi tiết. Vui lòng liên hệ nhân viên để biết thêm thông tin.'
    }

    return `Bạn là trợ lý ảo thông minh và thân thiện của nhà hàng ${restaurantInfo.name}. 

THÔNG TIN NHÀ HÀNG:
- Tên: ${restaurantInfo.name}
- Địa chỉ: ${restaurantInfo.address}
- Số điện thoại: ${restaurantInfo.phone}
- Giờ mở cửa: ${restaurantInfo.hours}
- Mô tả: ${restaurantInfo.description}


${menuInfo}

NHIỆM VỤ CỦA BẠN:
1. Luôn chào hỏi thân thiện khi khách hàng bắt đầu cuộc trò chuyện
2. Trả lời câu hỏi về thực đơn, món ăn, giá cả dựa trên dữ liệu trên
3. Hỗ trợ đặt bàn, đặt món
4. Tư vấn món ăn phù hợp
5. Cung cấp thông tin về nhà hàng
6. Hướng dẫn sử dụng dịch vụ
7. Trả lời các câu hỏi chung một cách lịch sự và hướng dẫn khách hàng về dịch vụ nhà hàng

QUY TẮC QUAN TRỌNG:
- CHỈ sử dụng thông tin từ dữ liệu nhà hàng ở trên
- KHÔNG được bịa đặt thông tin không có
- Nếu không có thông tin, hãy nói "Tôi sẽ chuyển bạn đến nhân viên để được hỗ trợ tốt hơn"
- Luôn lịch sự, thân thiện, nhiệt tình
- Trả lời bằng tiếng Việt
- Giữ câu trả lời ngắn gọn, dễ hiểu (tối đa 2-3 câu)
- Khi khách hàng chào hỏi (alo, hello, xin chào, chào, etc.), hãy chào lại và giới thiệu ngắn gọn về dịch vụ nhà hàng
- Khuyến khích khách hàng đặt món hoặc đặt bàn một cách tự nhiên

Hãy trả lời câu hỏi của khách hàng một cách tự nhiên và hữu ích, CHỈ dựa trên thông tin thực tế có sẵn.`
  }

  // Kiểm tra xem tin nhắn có cần GPT xử lý không
  shouldUseGPT(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim()

    // Bỏ qua tin nhắn rỗng hoặc quá ngắn (chỉ có 1 ký tự)
    if (lowerMessage.length <= 1) {
      return false
    }

    // Luôn trả lời mọi tin nhắn từ user để bot luôn thân thiện và sẵn sàng giúp đỡ
    // Bot sẽ tự động xử lý các câu hỏi không liên quan và hướng dẫn user
    return true
  }
}

const gptService = new GPTService()
export default gptService
