import { Router } from 'express'
import { clickPrepare, clickComplete } from '../services/click.service.js'

const router = Router()

// Click Prepare — POST /api/payment/click/prepare
router.post('/prepare', async (req, res) => {
  try {
    const result = await clickPrepare(req.body)
    res.json(result)
  } catch (err) {
    console.error('Click prepare xatosi:', err)
    res.json({ error: -8, error_note: 'Server error' })
  }
})

// Click Complete — POST /api/payment/click/complete
router.post('/complete', async (req, res) => {
  try {
    const result = await clickComplete(req.body)
    res.json(result)
  } catch (err) {
    console.error('Click complete xatosi:', err)
    res.json({ error: -8, error_note: 'Server error' })
  }
})

// Click to'lov URL yaratish (frontend uchun)
router.post('/init', async (req, res) => {
  try {
    const { orderId } = req.body
    const { Order } = await import('../models/index.js')

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' })

    const serviceId  = process.env.CLICK_SERVICE_ID
    const merchantId = process.env.CLICK_MERCHANT_ID
    const amount     = order.totalPrice + order.deliveryFee
    const returnUrl  = `${process.env.CLIENT_URL}/orders/${orderId}?payment=success`

    // Click to'lov URL
    const params = new URLSearchParams({
      service_id:       serviceId,
      merchant_id:      merchantId,
      amount:           amount,
      transaction_param: orderId,
      return_url:       returnUrl,
    })

    const checkoutUrl = `https://my.click.uz/services/pay?${params.toString()}`

    res.json({ success: true, url: checkoutUrl, amount, orderId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
