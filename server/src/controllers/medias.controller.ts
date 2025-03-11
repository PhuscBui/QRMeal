import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.service'

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadImage(req)
  res.json({
    message: COMMON_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    result: url
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const name = req.params.name
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status(HTTP_STATUS.NOT_FOUND).send({
        message: COMMON_MESSAGES.IMAGE_NOT_FOUND
      })
    }
  })
}
