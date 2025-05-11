import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import upload from '~/middlewares/upload.middlewares'

import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload', accessTokenValidator, upload.single('image'), wrapRequestHandler(uploadImageController))


export default mediasRouter
