/**
 * Click (Shop API) — ikki qadam: Prepare + Complete
 * Docs: https://docs.click.uz/
 *
 * .env ga qo'shing:
 *   CLICK_SERVICE_ID=your_service_id
 *   CLICK_MERCHANT_ID=your_merchant_id
 *   CLICK_SECRET_KEY=your_secret_key
 */

import crypto from 'crypto'
import { Order } from '../models/index.js'

// ── MD5 imzo tekshirish ───────────────────────────────────
const verifySign = (params, step) => {
  const secret = process.env.CLICK_SECRET_KEY

  let signString
  if (step === 'prepare') {
    signString = [
      params.click_trans_id,
      params.service_id,
      secret,
      params.merchant_trans_id,
      params.amount,
      params.action,
      params.sign_time,
    ].join('')
  } else {
    // complete
    signString = [
      params.click_trans_id,
      params.service_id,
      secret,
      params.merchant_trans_id,
      params.merchant_prepare_id,
      params.amount,
      params.action,
      params.sign_time,
    ].join('')
  }

  const expected = crypto.createHash('md5').update(signString).digest('hex')
  return expected === params.sign_string
}

// Click xato kodlari
const CLICK_ERRORS = {
  OK:                    0,
  SIGN_CHECK_FAILED:    -1,
  INCORRECT_PARAMETERS: -2,
  ACTION_NOT_FOUND:     -3,
  ALREADY_PAID:         -4,
  USER_NOT_FOUND:       -5,
  TRANSACTION_NOT_FOUND:-6,
  BAD_REQUEST:          -7,
  ERROR_IN_REQUEST:     -8,
  TRANSACTION_CANCELLED:-9,
}

// ── Prepare ───────────────────────────────────────────────
export const clickPrepare = async (params) => {
  const {
    click_trans_id, service_id, merchant_trans_id,
    amount, action, sign_time, sign_string
  } = params

  const base = {
    click_trans_id:     Number(click_trans_id),
    merchant_trans_id,
    merchant_prepare_id: null,
    error:               CLICK_ERRORS.OK,
    error_note:          'Success',
  }

  // Imzo tekshirish
  if (!verifySign(params, 'prepare')) {
    return { ...base, error: CLICK_ERRORS.SIGN_CHECK_FAILED, error_note: 'Sign check failed' }
  }

  // Buyurtma topish
  const order = await Order.findById(merchant_trans_id)
  if (!order) {
    return { ...base, error: CLICK_ERRORS.USER_NOT_FOUND, error_note: 'Order not found' }
  }

  // Summa tekshirish (Click tiyin emas, so'm yuboradi)
  const expectedAmount = order.totalPrice + order.deliveryFee
  if (Math.abs(Number(amount) - expectedAmount) > 1) {
    return { ...base, error: CLICK_ERRORS.INCORRECT_PARAMETERS, error_note: 'Incorrect amount' }
  }

  // Allaqachon to'langan
  if (order.paymentStatus === 'paid') {
    return { ...base, error: CLICK_ERRORS.ALREADY_PAID, error_note: 'Already paid' }
  }

  // Bekor qilingan
  if (order.status === 'cancelled') {
    return { ...base, error: CLICK_ERRORS.TRANSACTION_CANCELLED, error_note: 'Order cancelled' }
  }

  // Prepare yozuvi saqlash
  const prepareId = Date.now()
  await Order.findByIdAndUpdate(order._id, {
    'payment.clickTransId':  click_trans_id,
    'payment.prepareId':     prepareId,
    'payment.createTime':    Date.now(),
    'payment.state':         1,
    'payment.provider':      'click',
    paymentStatus:           'pending',
  })

  return { ...base, merchant_prepare_id: prepareId }
}

// ── Complete ──────────────────────────────────────────────
export const clickComplete = async (params) => {
  const {
    click_trans_id, service_id, merchant_trans_id,
    merchant_prepare_id, amount, action,
    sign_time, sign_string, error
  } = params

  const base = {
    click_trans_id:     Number(click_trans_id),
    merchant_trans_id,
    merchant_confirm_id: null,
    error:               CLICK_ERRORS.OK,
    error_note:          'Success',
  }

  // Imzo tekshirish
  if (!verifySign(params, 'complete')) {
    return { ...base, error: CLICK_ERRORS.SIGN_CHECK_FAILED, error_note: 'Sign check failed' }
  }

  // Click tomonidan xatolik (bekor qilish)
  if (Number(error) < 0) {
    await Order.findByIdAndUpdate(merchant_trans_id, {
      'payment.state': -1,
      'payment.cancelTime': Date.now(),
      paymentStatus: 'cancelled',
    })
    return { ...base, error: CLICK_ERRORS.TRANSACTION_CANCELLED, error_note: 'Transaction cancelled by Click' }
  }

  // Buyurtma topish
  const order = await Order.findById(merchant_trans_id)
  if (!order) {
    return { ...base, error: CLICK_ERRORS.TRANSACTION_NOT_FOUND, error_note: 'Order not found' }
  }

  // PrepareId tekshirish
  if (String(order.payment?.prepareId) !== String(merchant_prepare_id)) {
    return { ...base, error: CLICK_ERRORS.TRANSACTION_NOT_FOUND, error_note: 'Prepare ID mismatch' }
  }

  if (order.paymentStatus === 'paid') {
    return { ...base, merchant_confirm_id: order.payment.confirmId, error: CLICK_ERRORS.ALREADY_PAID }
  }

  // To'lovni tasdiqlash
  const confirmId = Date.now()
  await Order.findByIdAndUpdate(order._id, {
    'payment.state':      2,
    'payment.confirmId':  confirmId,
    'payment.performTime': Date.now(),
    paymentStatus:        'paid',
    status:               'processing',
  })

  return { ...base, merchant_confirm_id: confirmId }
}
