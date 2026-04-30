import { Router } from 'express'
import { upload, handleMulterError } from '../middleware/upload.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { Product } from '../models/index.js'

const router = Router()

// ── POST /api/upload/product/:id  — mahsulot rasmi yuklash ─
router.post(
  '/product/:id',
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Rasm fayli yuborilmadi' })
      }

      const product = await Product.findById(req.params.id)
      if (!product) {
        return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
      }

      // Eski rasmni o'chirish
      if (product.imagePublicId) {
        await deleteFromCloudinary(product.imagePublicId)
      }

      // Cloudinary ga yuklash
      const result = await uploadToCloudinary(req.file.buffer, {
        folder:   'orix-market/products',
        publicId: `product_${product._id}`,
        transformation: [
          { width: 800, height: 800, crop: 'fill', gravity: 'center' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      })

      // Mahsulotni yangilash
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        {
          image:         result.secure_url,
          imagePublicId: result.public_id,
        },
        { new: true }
      )

      res.json({
        success: true,
        message: 'Rasm muvaffaqiyatli yuklandi',
        data: {
          url:       result.secure_url,
          publicId:  result.public_id,
          width:     result.width,
          height:    result.height,
          product:   updated,
        },
      })
    } catch (err) {
      console.error('Upload xatosi:', err)
      res.status(500).json({ success: false, message: err.message })
    }
  }
)

// ── POST /api/upload/general — umumiy rasm yuklash ─────────
router.post(
  '/general',
  protect,
  adminOnly,
  upload.single('image'),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Rasm fayli yuborilmadi' })
      }

      const folder = req.body.folder || 'orix-market/general'

      const result = await uploadToCloudinary(req.file.buffer, { folder })

      res.json({
        success: true,
        data: {
          url:      result.secure_url,
          publicId: result.public_id,
          width:    result.width,
          height:   result.height,
          format:   result.format,
          size:     result.bytes,
        },
      })
    } catch (err) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
)

// ── POST /api/upload/bulk — bir nechta rasm ────────────────
router.post(
  '/bulk',
  protect,
  adminOnly,
  upload.array('images', 10),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ success: false, message: 'Rasmlar yuborilmadi' })
      }

      const folder  = req.body.folder || 'orix-market/general'
      const uploads = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, { folder }))
      )

      res.json({
        success: true,
        count:   uploads.length,
        data:    uploads.map(r => ({
          url:      r.secure_url,
          publicId: r.public_id,
          width:    r.width,
          height:   r.height,
        })),
      })
    } catch (err) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
)

// ── DELETE /api/upload/:publicId — rasm o'chirish ──────────
router.delete('/:publicId(*)', protect, adminOnly, async (req, res) => {
  try {
    const publicId = req.params.publicId
    await deleteFromCloudinary(publicId)

    // Mahsulotdan ham rasmni olib tashlash
    await Product.updateMany(
      { imagePublicId: publicId },
      { $unset: { image: '', imagePublicId: '' } }
    )

    res.json({ success: true, message: "Rasm o'chirildi" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
