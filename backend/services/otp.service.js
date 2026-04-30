/**
 * OTP (One-Time Password) tizimi
 * Foydalanuvchi telefon raqamini SMS orqali tasdiqlash
 */

import { sendSMS, SMS_TEMPLATES } from './sms.service.js'

// In-memory OTP store (production da Redis ishlatish tavsiya qilinadi)
const otpStore = new Map()
// { '998901234567': { code: '123456', expiresAt: Date, attempts: 0 } }

const OTP_EXPIRE_MS  = 3 * 60 * 1000  // 3 daqiqa
const MAX_ATTEMPTS   = 3
const OTP_COOLDOWN   = 60 * 1000      // 60 sekund

// 6 xonali random kod
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// ── OTP yuborish ──────────────────────────────────────────
export const sendOTP = async (phone) => {
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '998')

  // Cooldown tekshirish (spam oldini olish)
  const existing = otpStore.get(normalized)
  if (existing) {
    const cooldownLeft = OTP_COOLDOWN - (Date.now() - (existing.sentAt || 0))
    if (cooldownLeft > 0) {
      return {
        success: false,
        message: `Qayta yuborish uchun ${Math.ceil(cooldownLeft / 1000)} soniya kuting`,
        cooldown: cooldownLeft,
      }
    }
  }

  const code = generateCode()
  otpStore.set(normalized, {
    code,
    expiresAt: Date.now() + OTP_EXPIRE_MS,
    sentAt:    Date.now(),
    attempts:  0,
  })

  const result = await sendSMS(phone, SMS_TEMPLATES.otp(code))

  // Demo rejimda kodni log qilamiz
  if (result.demo) {
    console.log(`[OTP Demo] ${normalized} → Kod: ${code}`)
  }

  return {
    success:    true,
    expiresIn:  OTP_EXPIRE_MS / 1000,
    demo:       result.demo || false,
    // Faqat test muhitida kodni qaytaramiz
    ...(process.env.NODE_ENV !== 'production' && { _devCode: code }),
  }
}

// ── OTP tekshirish ────────────────────────────────────────
export const verifyOTP = (phone, code) => {
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '998')
  const record     = otpStore.get(normalized)

  if (!record) {
    return { valid: false, message: 'Kod yuborilmagan yoki muddati o\'tgan' }
  }

  // Urinishlar soni tekshirish
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalized)
    return { valid: false, message: 'Ko\'p noto\'g\'ri urinish. Qayta yuboring.' }
  }

  // Muddat tekshirish
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized)
    return { valid: false, message: 'Kod muddati o\'tgan. Qayta yuboring.' }
  }

  // Kod tekshirish
  if (record.code !== code.toString()) {
    otpStore.set(normalized, { ...record, attempts: record.attempts + 1 })
    const left = MAX_ATTEMPTS - record.attempts - 1
    return { valid: false, message: `Noto'g'ri kod. ${left} urinish qoldi.` }
  }

  // Muvaffaqiyatli — OTP o'chirish
  otpStore.delete(normalized)
  return { valid: true }
}

// Eskirgan OTP larni tozalash (15 daqiqada bir)
setInterval(() => {
  const now = Date.now()
  for (const [phone, record] of otpStore) {
    if (now > record.expiresAt + 60_000) otpStore.delete(phone)
  }
}, 15 * 60 * 1000)
