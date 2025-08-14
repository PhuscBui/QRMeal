import { config } from 'dotenv'
config()

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  clientUrl: process.env.CLIENT_URL as string,
  dbName: process.env.MONGODB_DATABASE as string,
  dbUsername: process.env.MONGODB_USERNAME as string,
  dbPassword: process.env.MONGODB_PASSWORD as string,
  dbAccountsCollection: process.env.MONGODB_ACCOUNTS_COLLECTION as string,
  dbRefreshTokensCollection: process.env.MONGODB_REFRESH_TOKENS_COLLECTION as string,
  dbDishesCollection: process.env.MONGODB_DISHES_COLLECTION as string,
  dbOrdersCollection: process.env.MONGODB_ORDERS_COLLECTION as string,
  dbTablesCollection: process.env.MONGODB_TABLES_COLLECTION as string,
  dbGuestsCollection: process.env.MONGODB_GUESTS_COLLECTION as string,
  dbDishSnapshotsCollection: process.env.MONGODB_DISH_SNAPSHOTS_COLLECTION as string,
  dbPromotionsCollection: process.env.MONGODB_PROMOTIONS_COLLECTION as string,
  dbGuestPromotionsCollection: process.env.MONGODB_GUEST_PROMOTIONS_COLLECTION as string,
  dbGuestLoyaltiesCollection: process.env.MONGODB_GUEST_LOYALTIES_COLLECTION as string,
  dbRevenuesCollection: process.env.MONGODB_REVENUES_COLLECTION as string,
  dbSocketsCollection: process.env.MONGODB_SOCKETS_COLLECTION as string,
  dbCategoriesCollection: process.env.MONGODB_CATEGORIES_COLLECTION as string,

  initialEmailOwner: process.env.INITIAL_EMAIL_OWNER as string,
  initialPasswordOwner: process.env.INITIAL_PASSWORD_OWNER as string,
  initialDateOfBirthOwner: process.env.INITIAL_DATE_OF_BIRTH_OWNER as string,

  passwordSecret: process.env.PASSWORD_SECRET as string,
  jwtSecret: process.env.JWT_SECRET as string,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  guestAccessTokenExpiresIn: process.env.GUEST_ACCESS_TOKEN_EXPIRES_IN as string,
  guestRefreshTokenExpiresIn: process.env.GUEST_REFRESH_TOKEN_EXPIRES_IN as string,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string
}
