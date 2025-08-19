import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES } from '~/constants/messages'

export const uploadImageController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'No file uploaded'
      })
      return
    }

    // Cloudinary returns additional metadata in the file object
    const { path: url } = req.file

    res.status(HTTP_STATUS.OK).json({
      message: 'File uploaded successfully',
      result: url
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Error uploading file'
    })
  }
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
