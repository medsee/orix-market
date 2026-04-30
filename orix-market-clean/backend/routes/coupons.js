import { Router } from 'express'
import { Coupon }  from '../models/Coupon.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// POST /api/coupons/validate — foydalanuvchi kodi tekshiradi
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderTotal } = req.body
    if (!code) return res.status(400).json({ success: false, message: 'Kod kerak' })

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() })
    if (!coupon) return res.status(404).json({ success: false, message: "Promokod topilmadi" })

    const check = coupon.validate(orderTotal || 0, req.user._id)
    if (!check.valid) return res.status(400).json({ success: false, message: check.msg })

    const discount = coupon.calcDiscount(orderTotal || 0)
    res.json({
      success: true,
      data: {
        code:        coupon.code,
        type:        coupon.type,
        value:       coupon.value,
        discount,
        description: coupon.description,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/coupons/apply — buyurtmaga kupon qo'llash
router.post('/apply', protect, async (req, res) => {
  try {
    const { code, orderId } = req.body
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (!coupon) return res.status(404).json({ success: false, message: 'Topilmadi' })

    await Coupon.findByIdAndUpdate(coupon._id, {
      $inc: { usedCount: 1 },
      $addToSet: { usedBy: req.user._id },
    })

    res.json({ success: true, message: 'Promokod qo\'llanildi' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Admin CRUD ────────────────────────────────────────────

// GET /api/coupons — barcha kuponlar (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt')
    res.json({ success: true, data: coupons })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/coupons — yangi kupon (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code?.toUpperCase().trim(),
    })
    res.status(201).json({ success: true, data: coupon })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Bu kod allaqachon mavjud' })
    res.status(400).json({ success: false, message: err.message })
  }
})

// PATCH /api/coupons/:id — tahrirlash (admin)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!coupon) return res.status(404).json({ success: false, message: 'Topilmadi' })
    res.json({ success: true, data: coupon })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /api/coupons/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "O'chirildi" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
