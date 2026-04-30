import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body
    const exists = await User.findOne({ phone })
    if (exists) return res.status(400).json({ success: false, message: 'Bu telefon raqam band' })

    const user  = await User.create({ name, phone, password })
    const token = signToken(user._id)
    res.status(201).json({ success: true, token, data: { _id: user._id, name: user.name, phone: user.phone, role: user.role } })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) return res.status(400).json({ success: false, message: 'Telefon va parol kerak' })

    const user = await User.findOne({ phone }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Telefon yoki parol noto'g'ri" })
    }

    const token = signToken(user._id)
    res.json({ success: true, token, data: { _id: user._id, name: user.name, phone: user.phone, role: user.role } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, data: req.user })
})

export default router
