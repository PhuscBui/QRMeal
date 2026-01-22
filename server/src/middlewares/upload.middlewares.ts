import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary'

// Configure Cloudinary storage with optimized settings
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      {
        width: 1000,
        height: 1000,
        crop: 'limit',
        quality: 'auto:good', // Optimize quality automatically
        fetch_format: 'auto', // Automatically choose best format
        flags: 'attachment' // Enable faster uploads
      }
    ],
    resource_type: 'auto', // Automatically detect resource type
    eager: [
      {
        width: 300,
        height: 300,
        crop: 'pad',
        background: 'white',
        format: 'jpg',
        quality: 'auto:good'
      }
    ], // Generate a smaller version immediately
    eager_async: true // Process eager transformations asynchronously
  } as any
})

// Create multer upload instance with optimized settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
      return cb(new Error('Only jpeg, jpg and png files are allowed'))
    }
    cb(null, true)
  }
})

export default upload
