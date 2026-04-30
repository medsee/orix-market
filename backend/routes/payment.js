import { Router } from 'express'
import paymeRouter from './payme.js'
import clickRouter from './click.js'
import { Order } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use('/payme', paymeRouter)
router.use('/click', clickRouter)

// To'lov holati — GET /api/payment/status/:orderId
router.get('/status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('paymentStatus payment status')
    if (!order) return res.status(404).json({ success: false, message: 'Topilmadi' })

    res.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        orderStatus:   order.status,
        provider:      order.payment?.provider || null,
        paidAt:        order.payment?.performTime
          ? new Date(order.payment.performTime).toISOString()
          : null,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
