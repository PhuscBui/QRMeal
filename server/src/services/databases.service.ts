import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/config'
import Account from '~/models/schemas/Account.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@qrmealcluster.hnxr3.mongodb.net/?retryWrites=true&w=majority&appName=QRMealCluster`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${envConfig.dbName}`)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('Unable to ping your deployment. Check your connection and try again.')
      console.error(error)
      throw error
    }
  }

  get accounts(): Collection<Account> {
    return this.db.collection(envConfig.dbAccountsCollection)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection)
  }
}

const databaseService = new DatabaseService()
export default databaseService
