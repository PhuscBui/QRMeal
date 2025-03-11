import { config } from 'dotenv'
config()

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  dbName: process.env.MONGODB_DATABASE as string,
  dbUsername: process.env.MONGODB_USERNAME as string,
  dbPassword: process.env.MONGODB_PASSWORD as string,
  dbAccountsCollection: process.env.MONGODB_ACCOUNTS_COLLECTION as string,
  dbRefreshTokensCollection: process.env.MONGODB_REFRESH_TOKENS_COLLECTION as string,
  dbDishesCollection: process.env.MONGODB_DISHES_COLLECTION as string,

  initialEmailOwner: process.env.INITIAL_EMAIL_OWNER as string,
  initialPasswordOwner: process.env.INITIAL_PASSWORD_OWNER as string,
  initialDateOfBirthOwner: process.env.INITIAL_DATE_OF_BIRTH_OWNER as string,

  passwordSecret: process.env.PASSWORD_SECRET as string,
  jwtSecret: process.env.JWT_SECRET as string,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string
}
