import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DISH_REVIEWS_MESSAGE, DISHES_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import dishReviewService from '~/services/dish-reviews.service'
import dishesService from '~/services/dishes.service'
import { validate } from '~/utils/validation'

const ratingSchema: ParamSchema = {
  isNumeric: {
    errorMessage: DISH_REVIEWS_MESSAGE.RATING_MUST_BE_A_NUMBER
  },
  isLength: {
    options: { min: 1 },
    errorMessage: DISH_REVIEWS_MESSAGE.RATING_LENGTH_MUST_BE_GREATER_THAN_0
  },
  custom: {
    options: (value: string) => {
      const rating = parseInt(value)
      if (rating < 1 || rating > 5) {
        throw new Error(DISH_REVIEWS_MESSAGE.RATING_MUST_BE_BETWEEN_1_AND_5)
      }
      return true
    }
  }
}

const commentSchema: ParamSchema = {
  isString: {
    errorMessage: DISH_REVIEWS_MESSAGE.COMMENT_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 0, max: 500 },
    errorMessage: DISH_REVIEWS_MESSAGE.COMMENT_LENGTH_MUST_BE_LESS_THAN_500
  },
  optional: { options: { nullable: true } }
}

const dishIdSchema: ParamSchema = {
  isString: {
    errorMessage: DISH_REVIEWS_MESSAGE.DISH_ID_MUST_BE_A_STRING
  },
  isMongoId: {
    errorMessage: DISH_REVIEWS_MESSAGE.DISH_ID_IS_INVALID
  },
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: DISHES_MESSAGE.DISH_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const dish = await dishesService.getDish(value)
      if (!dish) {
        throw new ErrorWithStatus({
          message: DISHES_MESSAGE.DISH_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

export const createDishReviewValidator = validate(
  checkSchema(
    {
      dish_id: dishIdSchema,
      rating: ratingSchema,
      comment: commentSchema
    },
    ['body']
  )
)

export const updateDishReviewValidator = validate(
  checkSchema(
    {
      rating: ratingSchema,
      comment: commentSchema
    },
    ['body']
  )
)

export const dishReviewIdValidator = validate(
  checkSchema(
    {
      reviewId: {
        notEmpty: {
          errorMessage: DISH_REVIEWS_MESSAGE.REVIEW_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: DISH_REVIEWS_MESSAGE.REVIEW_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: DISH_REVIEWS_MESSAGE.REVIEW_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const review = await dishReviewService.getDishReviewById(value)
            if (!review) {
              throw new ErrorWithStatus({
                message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.dishReview = review
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const ratingQueryValidator = validate(
  checkSchema(
    {
      rating: ratingSchema
    },
    ['query']
  )
)
