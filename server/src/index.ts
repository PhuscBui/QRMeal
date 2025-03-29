import express from 'express'
import { createServer } from 'http'
import { envConfig } from '~/config'
import { initOwnerAccount } from '~/controllers/accounts.controller'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import accountsRouter from '~/routes/accounts.routes'
import authRouter from '~/routes/auth.routes'
import dishesRouter from '~/routes/dishes.routes'
import guestsRouter from '~/routes/guests.routes'
import mediasRouter from '~/routes/medias.routes'
import ordersRouter from '~/routes/orders.routes'
import staticRouter from '~/routes/static.routes'
import tablesRouter from '~/routes/tables.routes'
import databaseService from '~/services/databases.service'
import { initFolder } from '~/utils/file'
import socketService from '~/utils/socket'
import cors from 'cors'
import helmet from 'helmet'

initFolder()

databaseService.connect()

const app = express()
const httpServer = createServer(app)
const port = envConfig.port

const start = async () => {
  await initOwnerAccount()
}

start()
app.use(
  cors({
    origin: 'http://localhost:3000', // Cho phép frontend truy cập
    credentials: true // Cho phép gửi cookie nếu cần
  })
)
app.use(helmet())

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(express.json())
app.use('/auth', authRouter)
app.use('/accounts', accountsRouter)
app.use('/dishes', dishesRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/tables', tablesRouter)
app.use('/guest', guestsRouter)
app.use('/orders', ordersRouter)

app.use(defaultErrorHandler)

socketService.initialize(httpServer)

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
