/**
 * Cloudinary sozlash
 * .env ga qo'shing:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 */
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Buffer → Cloudinary stream upload
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:         options.folder         || 'orix-market/products',
        transformation: options.transformation || [
          { width: 800, height: 800, crop: 'fill', gravity: 'center' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
        public_id: options.publicId || undefined,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

// Cloudinary dan rasm o'chirish
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return
  return cloudinary.uploader.destroy(publicId)
}

// Rasm URL ni transformer bilan qaytarish
export const getImageUrl = (publicId, transforms = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    width:  transforms.width  || 400,
    height: transforms.height || 400,
    crop:   transforms.crop   || 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  })
}

export default cloudinary
