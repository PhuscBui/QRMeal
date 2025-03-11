import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { Request } from 'express'
import sharp from 'sharp'
import fs from 'fs'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'
import { envConfig } from '~/config'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = UPLOAD_IMAGE_DIR + `/${newName}.jpg`
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: `http://localhost:${envConfig.port}/static/image/${newName}.jpg`
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
