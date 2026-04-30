import { Router } from 'express'
import { Product } from '../models/index.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// GET /api/products?category=&search=&featured=
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, limit = 50, page = 1 } = req.query
    const query = {}

    if (category && category !== 'all') query.category = category
    if (featured === 'true') query.featured = true
    if (search) query.name = { $regex: search, $options: 'i' }

    const skip     = (Number(page) - 1) * Number(limit)
    const total    = await Product.countDocuments(query)
    const products = await Product.find(query).skip(skip).limit(Number(limit)).sort('-createdAt')

    res.json({ success: true, total, page: Number(page), data: products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true, inStock: true }).limit(12)
    res.json({ success: true, data: products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/products/search?q=
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ success: true, data: [] })
    const products = await Product.find({ name: { $regex: q, $options: 'i' } }).limit(20)
    res.json({ success: true, data: products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/products (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT /api/products/:id (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /api/products/:id (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "Mahsulot o'chirildi" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
