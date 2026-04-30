/**
 * Buyurtma holati o'zgarganda avtomatik SMS yuborish
 * Bu funksiyalar orders route va payment callback dan chaqiriladi
 */

import { sendSMS, SMS_TEMPLATES } from './sms.service.js'
import { Order } from '../models/index.js'

// Buyurtma ID ni qisqa ko'rinishga keltirish: 507f1f77bcf86cd → ORX-1F77
const shortId = (id) => 'ORX-' + id.toString().slice(-4).toUpperCase()

// ── Buyurtma yaratildi ────────────────────────────────────
export const notifyOrderCreated = async (order) => {
  try {
    const id      = shortId(order._id)
    const total   = new Intl.NumberFormat('uz-UZ').format(
      order.totalPrice + (order.deliveryFee || 0)
    )
    await sendSMS(order.phone, SMS_TEMPLATES.orderCreated(id, total))
    console.log(`[Notify] orderCreated → ${order.phone}`)
  } catch (err) {
    console.error('[Notify] orderCreated xatosi:', err.message)
  }
}

// ── To'lov tasdiqlandi ────────────────────────────────────
export const notifyPaymentConfirmed = async (order, provider = 'Naqd') => {
  try {
    const id      = shortId(order._id)
    const methods = { payme: 'Payme', click: 'Click', uzum: 'Uzum Pay', cash: 'Naqd pul' }
    const label   = methods[provider] || provider
    await sendSMS(order.phone, SMS_TEMPLATES.paymentConfirmed(id, label))
    console.log(`[Notify] paymentConfirmed → ${order.phone}`)
  } catch (err) {
    console.error('[Notify] paymentConfirmed xatosi:', err.message)
  }
}

// ── Kuryer yo'lda ─────────────────────────────────────────
export const notifyOrderOnTheWay = async (order, courierName = 'Kuryer') => {
  try {
    const id = shortId(order._id)
    await sendSMS(order.phone, SMS_TEMPLATES.orderOnTheWay(id, courierName))
    console.log(`[Notify] orderOnTheWay → ${order.phone}`)
  } catch (err) {
    console.error('[Notify] orderOnTheWay xatosi:', err.message)
  }
}

// ── Yetkazildi ────────────────────────────────────────────
export const notifyOrderDelivered = async (order) => {
  try {
    const id = shortId(order._id)
    await sendSMS(order.phone, SMS_TEMPLATES.orderDelivered(id))
    console.log(`[Notify] orderDelivered → ${order.phone}`)
  } catch (err) {
    console.error('[Notify] orderDelivered xatosi:', err.message)
  }
}

// ── Bekor qilindi ─────────────────────────────────────────
export const notifyOrderCancelled = async (order, reason = 'Texnik sabab') => {
  try {
    const id = shortId(order._id)
    await sendSMS(order.phone, SMS_TEMPLATES.orderCancelled(id, reason))
    console.log(`[Notify] orderCancelled → ${order.phone}`)
  } catch (err) {
    console.error('[Notify] orderCancelled xatosi:', err.message)
  }
}

// ── Holat o'zgarganda avtomatik trigger ──────────────────
export const triggerStatusNotification = async (orderId, newStatus, extra = {}) => {
  try {
    const order = await Order.findById(orderId)
    if (!order) return

    switch (newStatus) {
      case 'processing':
        // To'lov bo'lsa — to'lov bildirishi, bo'lmasa — oddiy
        if (order.paymentStatus === 'paid') {
          await notifyPaymentConfirmed(order, order.payment?.provider)
        }
        break
      case 'on_the_way':
        await notifyOrderOnTheWay(order, extra.courierName)
        break
      case 'delivered':
        await notifyOrderDelivered(order)
        break
      case 'cancelled':
        await notifyOrderCancelled(order, extra.reason)
        break
    }
  } catch (err) {
    console.error('[Notify] triggerStatusNotification xatosi:', err.message)
  }
}
