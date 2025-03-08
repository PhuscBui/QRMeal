import { config } from 'dotenv'
config()

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  dbName: process.env.MONGODB_DATABASE as string,
  dbUsername: process.env.MONGODB_USERNAME as string,
  dbPassword: process.env.MONGODB_PASSWORD as string,
  dbAccountsCollection: process.env.MONGODB_ACCOUNTS_COLLECTION as string,

  passwordSecret: process.env.PASSWORD_SECRET as string
}
