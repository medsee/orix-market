import { Router } from 'express'
import { Category } from '../models/index.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort('order')
    res.json({ success: true, data: cats })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.create(req.body)
    res.status(201).json({ success: true, data: cat })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
