import { Router } from 'express'

const ordersRouter = Router()

ordersRouter.post('', (req, res) => {
  res.send('Create order')
})

export default ordersRouter
