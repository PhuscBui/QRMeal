import { Router } from 'express'
import { getIndicatorsController } from '~/controllers/indicators.controller'
import { dateQueryValidator } from '~/middlewares/common.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const indicatorsRouter = Router()

indicatorsRouter.get('/dashboard', dateQueryValidator, wrapRequestHandler(getIndicatorsController))

export default indicatorsRouter
