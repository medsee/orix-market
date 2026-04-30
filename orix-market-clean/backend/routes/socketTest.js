/**
 * Socket test endpoint — faqat development da
 * Buyurtma statusini simulatsiya qilish uchun
 *
 * POST /api/socket/test-update
 * { orderId, status, courierName? }
 */
import { Router } from 'express'
import { emitOrderUpdate, emitNewOrder } from '../socket/index.js'

const router = Router()

// Faqat development muhitida ishlaydi
const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' })
  }
  next()
}

// Holat yangilash simulatsiyasi
router.post('/test-update', devOnly, (req, res) => {
  const { orderId, status, courierName } = req.body
  if (!orderId || !status) {
    return res.status(400).json({ success: false, message: 'orderId va status kerak' })
  }

  emitOrderUpdate(orderId, {
    status,
    courierName: courierName || null,
    updatedAt:   new Date().toISOString(),
  })

  res.json({ success: true, message: `Socket event yuborildi: ${orderId} → ${status}` })
})

// Yangi buyurtma simulatsiyasi
router.post('/test-new-order', devOnly, (req, res) => {
  const mockOrder = {
    _id:         req.body.orderId || 'test_' + Date.now(),
    phone:       '+998901234567',
    totalPrice:  req.body.total || 85000,
    deliveryFee: 0,
    items:       [{ name: 'Test mahsulot', emoji: '🧪', price: 85000, quantity: 1 }],
  }

  emitNewOrder(mockOrder)
  res.json({ success: true, message: 'Yangi buyurtma event yuborildi', order: mockOrder })
})

// Barqaror test: 5 qadam birin-ketin yuborish
router.post('/test-flow', devOnly, async (req, res) => {
  const { orderId = 'flow_test_' + Date.now() } = req.body
  const steps = ['pending', 'processing', 'on_the_way', 'delivered']
  const delay = (ms) => new Promise(r => setTimeout(r, ms))

  res.json({ success: true, orderId, message: `${steps.length} ta event 2 sekundda yuboriladi` })

  for (const status of steps) {
    await delay(2000)
    emitOrderUpdate(orderId, { status, courierName: status === 'on_the_way' ? 'Jasur Toshmatov' : null })
    console.log(`[Test flow] ${orderId} → ${status}`)
  }
})

export default router
