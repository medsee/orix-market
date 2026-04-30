/**
 * SMS Service — Eskiz.uz (asosiy) + Playmobile (zaxira)
 *
 * .env ga qo'shing:
 *   ESKIZ_EMAIL=your@email.com
 *   ESKIZ_PASSWORD=your_password
 *   ESKIZ_FROM=4546
 *   PLAYMOBILE_LOGIN=your_login
 *   PLAYMOBILE_PASSWORD=your_password
 *   PLAYMOBILE_ORIGINATOR=Orix
 *   SMS_PROVIDER=eskiz
 */
import axios from 'axios'

let eskizToken    = null
let eskizTokenExp = 0

const getEskizToken = async () => {
  if (eskizToken && Date.now() < eskizTokenExp) return eskizToken
  const res = await axios.post('https://notify.eskiz.uz/api/auth/login', {
    email:    process.env.ESKIZ_EMAIL,
    password: process.env.ESKIZ_PASSWORD,
  })
  eskizToken    = res.data.data.token
  eskizTokenExp = Date.now() + 28 * 24 * 60 * 60 * 1000
  return eskizToken
}

const normalizePhone = (phone) =>
  phone.replace(/\D/g, '').replace(/^0/, '998')

const sendViaEskiz = async (phone, message) => {
  const token = await getEskizToken()
  const res = await axios.post(
    'https://notify.eskiz.uz/api/message/sms/send',
    { mobile_phone: normalizePhone(phone), message, from: process.env.ESKIZ_FROM || '4546', callback_url: null },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return { provider: 'eskiz', messageId: res.data.data?.id, status: res.data.status }
}

const sendViaPlaymobile = async (phone, message) => {
  const res = await axios.post(
    'https://send.smsgateway.uz/sms/json',
    {
      messages: [{
        recipient: normalizePhone(phone),
        message_id: Date.now().toString(),
        sms: { originator: process.env.PLAYMOBILE_ORIGINATOR || 'Orix', content: { text: message } },
      }],
    },
    { auth: { username: process.env.PLAYMOBILE_LOGIN, password: process.env.PLAYMOBILE_PASSWORD } }
  )
  return { provider: 'playmobile', status: res.data.status }
}

export const sendSMS = async (phone, message) => {
  const provider = process.env.SMS_PROVIDER || 'eskiz'
  try {
    return provider === 'eskiz'
      ? await sendViaEskiz(phone, message)
      : await sendViaPlaymobile(phone, message)
  } catch (err) {
    console.error(`${provider} SMS xatosi:`, err.message)
    try {
      const fallback = provider === 'eskiz' ? 'playmobile' : 'eskiz'
      console.log(`Fallback: ${fallback}`)
      return fallback === 'playmobile'
        ? await sendViaPlaymobile(phone, message)
        : await sendViaEskiz(phone, message)
    } catch (e) {
      console.error('SMS fallback ham ishlamadi:', e.message)
      throw new Error("SMS yuborib bo'lmadi")
    }
  }
}

export const SMS_TEMPLATES = {
  orderConfirmed: (orderNum, total) =>
    `Orix Market: Buyurtmangiz #${orderNum} qabul qilindi! Summa: ${Number(total).toLocaleString('uz-UZ')} so'm. Tez orada yetkazib beramiz.`,

  orderShipped: (orderNum, courierName) =>
    `Orix Market: #${orderNum} buyurtmangiz yo'lda! Kuryer: ${courierName}. Taxminiy vaqt: 30-60 daqiqa.`,

  orderDelivered: (orderNum) =>
    `Orix Market: #${orderNum} buyurtmangiz yetkazildi! Xarid uchun rahmat! orixmarket.uz`,

  orderCancelled: (orderNum, reason) =>
    `Orix Market: #${orderNum} buyurtmangiz bekor qilindi.${reason ? ' Sabab: ' + reason + '.' : ''} Savollar: +998712000000`,

  paymentConfirmed: (orderNum, amount) =>
    `Orix Market: #${orderNum} uchun to'lov qabul qilindi. Summa: ${Number(amount).toLocaleString('uz-UZ')} so'm. Rahmat!`,

  otp: (code) =>
    `Orix Market: Tasdiqlash kodi: ${code}. Ushbu kodni hech kimga bermang!`,
}
