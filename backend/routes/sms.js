import { Router } from 'express'
import { sendOTP, verifyOTP }     from '../services/otp.service.js'
import { sendSMS }                from '../services/sms.service.js'
import { protect, adminOnly }     from '../middleware/auth.js'

const router = Router()

// ── POST /api/sms/otp/send ────────────────────────────────
router.post('/otp/send', async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ success: false, message: 'Telefon raqam kerak' })

  try {
    const result = await sendOTP(phone)
    if (!result.success) {
      return res.status(429).json({ success: false, message: result.message, cooldown: result.cooldown })
    }
    res.json({
      success:   true,
      message:   'SMS kod yuborildi',
      expiresIn: result.expiresIn,
      // Dev muhitida kodni qaytaramiz
      ...(result._devCode && { _devCode: result._devCode }),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/sms/otp/verify ──────────────────────────────
router.post('/otp/verify', async (req, res) => {
  const { phone, code } = req.body
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: 'Telefon va kod kerak' })
  }

  const result = verifyOTP(phone, code)
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message })
  }

  res.json({ success: true, message: 'Telefon raqam tasdiqlandi', verified: true })
})

// ── POST /api/sms/test — admin test SMS ──────────────────
router.post('/test', protect, adminOnly, async (req, res) => {
  const { phone, message } = req.body
  if (!phone || !message) {
    return res.status(400).json({ success: false, message: 'Telefon va xabar kerak' })
  }

  const result = await sendSMS(phone, message)
  res.json({ success: result.success, data: result })
})

// ── GET /api/sms/status — SMS xizmat holati ───────────────
router.get('/status', protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    data: {
      enabled:  process.env.SMS_ENABLED === 'true',
      provider: 'Eskiz.uz',
      from:     process.env.ESKIZ_FROM || '4546',
      mode:     process.env.SMS_ENABLED === 'true' ? 'production' : 'demo (log only)',
    }
  })
})

export default router
