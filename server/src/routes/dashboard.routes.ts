import { Router } from 'express'

const dashboardRouter = Router()

dashboardRouter.get('/', (req, res) => {
  res.send('Dashboard')
})

export default dashboardRouter
