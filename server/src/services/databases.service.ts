import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/config'
import Account from '~/models/schemas/Account.schema'
import Category from '~/models/schemas/Category.schema'
import CustomerPromotion from '~/models/schemas/CustomerPromotion.Schema'
import Delivery from '~/models/schemas/Delivery.schema'
import Dish from '~/models/schemas/Dish.schema'
import DishReview from '~/models/schemas/DishReview.schema'
import DishSnapshot from '~/models/schemas/DishSnapshot.schema'
import Guest from '~/models/schemas/Guest.schema'
import GuestPromotion from '~/models/schemas/GuestPromotion.schema'
import Loyalty from '~/models/schemas/Loyalty.schema'
import Order from '~/models/schemas/Order.schema'
import OrderGroup from '~/models/schemas/OrderGroup.schema'
import Promotion from '~/models/schemas/Promotion.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Revenue from '~/models/schemas/Revenue.schema'
import Shift from '~/models/schemas/Shift.schema'
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

  get promotions(): Collection<Promotion> {
    return this.db.collection(envConfig.dbPromotionsCollection)
  }

  get customer_promotions(): Collection<CustomerPromotion> {
    return this.db.collection(envConfig.dbCustomerPromotionsCollection)
  }

  get guest_promotions(): Collection<GuestPromotion> {
    return this.db.collection(envConfig.dbGuestPromotionsCollection)
  }

  get loyalties(): Collection<Loyalty> {
    return this.db.collection(envConfig.dbLoyaltiesCollection)
  }

  get revenues(): Collection<Revenue> {
    return this.db.collection(envConfig.dbRevenuesCollection)
  }

  get sockets(): Collection<Socket> {
    return this.db.collection(envConfig.dbSocketsCollection)
  }

  get categories(): Collection<Category> {
    return this.db.collection(envConfig.dbCategoriesCollection)
  }

  get dishReviews(): Collection<DishReview> {
    return this.db.collection(envConfig.dbDishReviewsCollection)
  }

  get deliveries(): Collection<Delivery> {
    return this.db.collection(envConfig.dbDeliveriesCollection)
  }

  get orderGroups(): Collection<OrderGroup> {
    return this.db.collection(envConfig.dbOrderGroupsCollection)
  }

  get shifts(): Collection<Shift> {
    return this.db.collection(envConfig.dbShiftsCollection)
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
