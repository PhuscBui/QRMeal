import express from 'express'
import { envConfig } from '~/config'
import { initOwnerAccount } from '~/controllers/accounts.controller'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import accountsRouter from '~/routes/accounts.routes'
import authRouter from '~/routes/auth.routes'
import dishesRouter from '~/routes/dishes.routes'
import databaseService from '~/services/databases.service'

databaseService.connect()

const app = express()
const port = envConfig.port

const start = async () => {
  await initOwnerAccount()
}

start()

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(express.json())
app.use('/auth', authRouter)
app.use('/accounts', accountsRouter)
app.use('/dishes', dishesRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
