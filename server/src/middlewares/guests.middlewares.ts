// import { checkSchema } from "express-validator"
// import { validate } from "~/utils/validation"

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
//             const user = await databaseService.accounts.findOne({
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
