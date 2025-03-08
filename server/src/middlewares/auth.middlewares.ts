// import { checkSchema, ParamSchema } from 'express-validator'
// import { USERS_MESSAGES } from '~/constants/messages'
// import { hashPassword } from '~/utils/crypto'
// import { validate } from '~/utils/validation'

// const passwordSchema: ParamSchema = {
//   notEmpty: {
//     errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
//   },
//   isString: {
//     errorMessage: USERS_MESSAGES.PASSWORD_IS_MUST_BE_A_STRING
//   },
//   isLength: {
//     options: { min: 6, max: 100 },
//     errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
//   },
//   isStrongPassword: {
//     options: {
//       minLength: 6,
//       minLowercase: 1,
//       minUppercase: 1,
//       minNumbers: 1,
//       minSymbols: 1
//     },
//     errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRONG
//   }
// }

// export const loginValidator = validate(
//   checkSchema(
//     {
//       email: {
//         isEmail: {
//           errorMessage: USERS_MESSAGES.EMAIL_IS_VALID
//         },
//         notEmpty: {
//           errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
//         },
//         trim: true,
//         custom: {
//           options: async (value, { req }) => {
//             const user = await databaseService.users.findOne({
//               email: value,
//               password: hashPassword(req.body.password)
//             })
//             if (user === null) {
//               return Promise.reject(new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT))
//             }
//             req.user = user
//             return Promise.resolve()
//           }
//         }
//       },
//       password: passwordSchema
//     },
//     ['body']
//   )
// )
