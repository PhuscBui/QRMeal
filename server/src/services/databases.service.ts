import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/config'
import Account from '~/models/schemas/Account.schema'
import Dish from '~/models/schemas/Dish.schema'
import DishSnapshot from '~/models/schemas/DishSnapshot.schema'
import Guest from '~/models/schemas/Guest.schema'
import Order from '~/models/schemas/Order.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Socket from '~/models/schemas/Socket.schema'
import { Table } from '~/models/schemas/Table.schema'

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

  get dishes(): Collection<Dish> {
    return this.db.collection(envConfig.dbDishesCollection)
  }

  get orders(): Collection<Order> {
    return this.db.collection(envConfig.dbOrdersCollection)
  }

  get dishSnapshots(): Collection<DishSnapshot> {
    return this.db.collection(envConfig.dbDishSnapshotsCollection)
  }

  get tables(): Collection<Table> {
    return this.db.collection(envConfig.dbTablesCollection)
  }

  get guests(): Collection<Guest> {
    return this.db.collection(envConfig.dbGuestsCollection)
  }

  get sockets(): Collection<Socket> {
    return this.db.collection(envConfig.dbSocketsCollection)
  }

  get clientInstance(): MongoClient {
    return this.client
  }
  get dbInstance(): Db {
    return this.db
  }
}

const databaseService = new DatabaseService()
export default databaseService
