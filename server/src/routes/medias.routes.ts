import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'

import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload', accessTokenValidator, wrapRequestHandler(uploadImageController))

export default mediasRouter
