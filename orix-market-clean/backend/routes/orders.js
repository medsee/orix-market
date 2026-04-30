import { Router } from 'express'
import { Order } from '../models/index.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { notifyOrderCreated, triggerStatusNotification } from '../services/notification.service.js'
import { emitNewOrder, emitOrderUpdate } from '../socket/index.js'

const router = Router()

// POST /api/orders — buyurtma yaratish + SMS yuborish
router.post('/', async (req, res) => {
  try {
    const { items, address, phone, paymentMethod, note } = req.body
    if (!items?.length) return res.status(400).json({ success: false, message: "Savatcha bo'sh" })

    const totalPrice  = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const deliveryFee = totalPrice >= 100000 ? 0 : 15000

    const order = await Order.create({
      user: req.user?._id,
      items, totalPrice, deliveryFee,
      address, phone,
      paymentMethod: paymentMethod || 'cash',
      note,
    })

    // Naqd to'lov bo'lsa darhol SMS yuboramiz
    // Onlayn to'lov bo'lsa — to'lov tasdiqlangandan keyin yuboriladi
    // Socket: admin ga yangi buyurtma xabari
    emitNewOrder(order)

    // SMS: naqd to'lovda darhol yuboramiz
    if (paymentMethod === 'cash') {
      notifyOrderCreated(order).catch(console.error)
    }

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/orders/my
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt')
    res.json({ success: true, data: orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders — admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = status ? { status } : {}
    const orders = await Order.find(filter)
      .populate('user', 'name phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
    const total = await Order.countDocuments(filter)
    res.json({ success: true, total, data: orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' })
    if (order.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Ruxsat yo'q" })
    }
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/orders/:id/status — holat yangilash + SMS
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, courierName, reason } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!order) return res.status(404).json({ success: false, message: 'Topilmadi' })

    // Socket: real-time holat yangilash
    emitOrderUpdate(order._id.toString(), {
      status,
      courierName: courierName || null,
      updatedAt: new Date().toISOString(),
    })

    // SMS notification
    triggerStatusNotification(order._id, status, { courierName, reason })
      .catch(console.error)

    res.json({ success: true, data: order })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
