/**
 * Payme (Merchant API) — JSONRPC 2.0 protokoli
 * Docs: https://developer.help.paycom.uz/
 *
 * Payme test kredensiallari .env ga qo'shing:
 *   PAYME_MERCHANT_ID=your_merchant_id
 *   PAYME_SECRET_KEY=your_secret_key
 *   PAYME_TEST_SECRET_KEY=your_test_secret_key
 *   PAYME_TEST_MODE=true
 */

import crypto from 'crypto'
import { Order } from '../models/index.js'
import { notifyOrderCreated, notifyPaymentConfirmed } from './notification.service.js'

// ── Payme xato kodlari ────────────────────────────────────
export const PAYME_ERRORS = {
  INVALID_AMOUNT:       { code: -31001, message: { uz: "Noto'g'ri summa",          ru: 'Неверная сумма',         en: 'Invalid amount' } },
  INVALID_ACCOUNT:      { code: -31050, message: { uz: "Buyurtma topilmadi",       ru: 'Заказ не найден',        en: 'Order not found' } },
  WRONG_AMOUNT:         { code: -31001, message: { uz: "Summa mos kelmaydi",       ru: 'Сумма не совпадает',     en: 'Amount mismatch' } },
  TRANSACTION_NOT_FOUND:{ code: -31003, message: { uz: "Tranzaksiya topilmadi",   ru: 'Транзакция не найдена',  en: 'Transaction not found' } },
  CANT_CANCEL:          { code: -31007, message: { uz: "Bekor qilib bo'lmaydi",   ru: 'Невозможно отменить',    en: 'Cannot cancel' } },
  ALREADY_DONE:         { code: -31060, message: { uz: "Allaqachon bajarilgan",   ru: 'Уже выполнено',          en: 'Already done' } },
}

// Payme dan kelgan so'rovni tekshirish
export const verifyPaymeAuth = (req) => {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Basic ')) return false

  const secret = process.env.PAYME_TEST_MODE === 'true'
    ? process.env.PAYME_TEST_SECRET_KEY
    : process.env.PAYME_SECRET_KEY

  const expected = Buffer.from(`Paycom:${secret}`).toString('base64')
  const received = auth.replace('Basic ', '')
  return received === expected
}

// ── CheckPerformTransaction ───────────────────────────────
export const checkPerformTransaction = async ({ params }) => {
  const orderId = params?.account?.order_id
  if (!orderId) return { error: PAYME_ERRORS.INVALID_ACCOUNT }

  const order = await Order.findById(orderId)
  if (!order) return { error: PAYME_ERRORS.INVALID_ACCOUNT }

  const expectedAmount = (order.totalPrice + order.deliveryFee) * 100 // tiyin
  if (params.amount !== expectedAmount) return { error: PAYME_ERRORS.WRONG_AMOUNT }

  return { result: { allow: true } }
}

// ── CreateTransaction ─────────────────────────────────────
export const createTransaction = async ({ id, time, params }) => {
  const orderId = params?.account?.order_id
  const order   = await Order.findById(orderId)
  if (!order) return { error: PAYME_ERRORS.INVALID_ACCOUNT }

  const expectedAmount = (order.totalPrice + order.deliveryFee) * 100
  if (params.amount !== expectedAmount) return { error: PAYME_ERRORS.WRONG_AMOUNT }

  // Agar tranzaksiya avval yaratilgan bo'lsa
  if (order.payment?.transactionId) {
    if (order.payment.transactionId !== id) return { error: PAYME_ERRORS.ALREADY_DONE }
    return {
      result: {
        create_time: order.payment.createTime,
        transaction: order.payment.transactionId,
        state: 1,
      }
    }
  }

  const now = Date.now()
  await Order.findByIdAndUpdate(orderId, {
    'payment.transactionId': id,
    'payment.createTime':    now,
    'payment.state':         1,
    'payment.provider':      'payme',
    paymentStatus:           'pending',
  })

  return {
    result: {
      create_time: now,
      transaction: id,
      state: 1,
    }
  }
}

// ── PerformTransaction ────────────────────────────────────
export const performTransaction = async ({ id }) => {
  const order = await Order.findOne({ 'payment.transactionId': id })
  if (!order) return { error: PAYME_ERRORS.TRANSACTION_NOT_FOUND }

  if (order.payment.state === 2) {
    return {
      result: {
        transaction:  id,
        perform_time: order.payment.performTime,
        state: 2,
      }
    }
  }

  const now = Date.now()
  const updated = await Order.findByIdAndUpdate(order._id, {
    'payment.state':       2,
    'payment.performTime': now,
    paymentStatus:         'paid',
    status:                'processing',
  }, { new: true })

  // SMS bildirish — async
  if (updated) {
    notifyOrderCreated(updated).catch(console.error)
    notifyPaymentConfirmed(updated, 'payme').catch(console.error)
  }

  return {
    result: {
      transaction:  id,
      perform_time: now,
      state: 2,
    }
  }
}

// ── CancelTransaction ─────────────────────────────────────
export const cancelTransaction = async ({ id, params }) => {
  const order = await Order.findOne({ 'payment.transactionId': id })
  if (!order) return { error: PAYME_ERRORS.TRANSACTION_NOT_FOUND }

  if (order.payment.state === 2 && order.status === 'delivered') {
    return { error: PAYME_ERRORS.CANT_CANCEL }
  }

  const now = Date.now()
  await Order.findByIdAndUpdate(order._id, {
    'payment.state':      -1,
    'payment.cancelTime': now,
    'payment.reason':     params?.reason,
    paymentStatus:        'cancelled',
    status:               'cancelled',
  })

  return {
    result: {
      transaction:  id,
      cancel_time:  now,
      state: -1,
    }
  }
}

// ── CheckTransaction ──────────────────────────────────────
export const checkTransaction = async ({ id }) => {
  const order = await Order.findOne({ 'payment.transactionId': id })
  if (!order) return { error: PAYME_ERRORS.TRANSACTION_NOT_FOUND }

  return {
    result: {
      create_time:  order.payment.createTime  || 0,
      perform_time: order.payment.performTime || 0,
      cancel_time:  order.payment.cancelTime  || 0,
      transaction:  id,
      state:        order.payment.state,
      reason:       order.payment.reason || null,
    }
  }
}

// ── GetStatement ──────────────────────────────────────────
export const getStatement = async ({ params }) => {
  const orders = await Order.find({
    'payment.provider': 'payme',
    'payment.createTime': { $gte: params.from, $lte: params.to }
  })

  const transactions = orders.map(o => ({
    id:           o.payment.transactionId,
    time:         o.payment.createTime,
    amount:       (o.totalPrice + o.deliveryFee) * 100,
    account:      { order_id: o._id.toString() },
    create_time:  o.payment.createTime  || 0,
    perform_time: o.payment.performTime || 0,
    cancel_time:  o.payment.cancelTime  || 0,
    transaction:  o.payment.transactionId,
    state:        o.payment.state,
    reason:       o.payment.reason || null,
  }))

  return { result: { transactions } }
}
