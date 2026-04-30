import multer from 'multer'

// Rasm fayl turlari
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_MB   = 5

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Faqat JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi'), false)
  }
}

// Memory storage — buffer Cloudinary ga uzatiladi (disk ishlatilmaydi)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter,
})

// Multer xatolarini ushlab olish
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Fayl hajmi ${MAX_SIZE_MB}MB dan oshmasligi kerak`,
      })
    }
    return res.status(400).json({ success: false, message: err.message })
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message })
  }
  next()
}
