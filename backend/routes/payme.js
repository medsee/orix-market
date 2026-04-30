import { Router } from 'express'
import {
  verifyPaymeAuth,
  checkPerformTransaction,
  createTransaction,
  performTransaction,
  cancelTransaction,
  checkTransaction,
  getStatement,
  PAYME_ERRORS,
} from '../services/payme.service.js'

const router = Router()

// Barcha Payme so'rovlari POST /api/payment/payme ga keladi
router.post('/', async (req, res) => {
  // 1. Auth tekshirish
  if (!verifyPaymeAuth(req)) {
    return res.status(401).json({
      error: { code: -32504, message: { uz: 'Ruxsatsiz', ru: 'Не авторизован', en: 'Unauthorized' } }
    })
  }

  const { method, params, id } = req.body

  // 2. Method dispatch
  const dispatch = {
    CheckPerformTransaction: checkPerformTransaction,
    CreateTransaction:       createTransaction,
    PerformTransaction:      performTransaction,
    CancelTransaction:       cancelTransaction,
    CheckTransaction:        checkTransaction,
    GetStatement:            getStatement,
  }

  const handler = dispatch[method]
  if (!handler) {
    return res.json({
      id,
      error: { code: -32601, message: { uz: 'Method topilmadi', ru: 'Метод не найден', en: 'Method not found' } }
    })
  }

  try {
    const result = await handler({ id, params, time: Date.now() })

    if (result.error) {
      return res.json({ id, error: result.error })
    }

    return res.json({ id, result: result.result })
  } catch (err) {
    console.error('Payme handler xatosi:', err)
    return res.json({
      id,
      error: { code: -31008, message: { uz: 'Server xatosi', ru: 'Ошибка сервера', en: 'Server error' } }
    })
  }
})

// Payme to'lov URL yaratish (frontend uchun)
router.post('/init', async (req, res) => {
  try {
    const { orderId } = req.body
    const { Order } = await import('../models/index.js')

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' })

    const merchantId = process.env.PAYME_MERCHANT_ID
    const amount     = (order.totalPrice + order.deliveryFee) * 100 // tiyin
    const account    = JSON.stringify({ order_id: orderId })
    const encodedAccount = Buffer.from(account).toString('base64')

    // Payme checkout URL
    const baseUrl = process.env.PAYME_TEST_MODE === 'true'
      ? 'https://checkout.test.paycom.uz'
      : 'https://checkout.paycom.uz'

    const checkoutUrl = `${baseUrl}/${merchantId}?amount=${amount}&account[order_id]=${orderId}&lang=uz`

    res.json({ success: true, url: checkoutUrl, amount, orderId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
