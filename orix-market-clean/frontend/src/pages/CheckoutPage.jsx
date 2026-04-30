import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersAPI } from '../data/api'
import { formatPrice } from '../data/mockData'
import CouponInput from '../components/CouponInput'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Naqd pul',  icon: '💵' },
  { id: 'payme', label: 'Payme',     icon: '💳' },
  { id: 'click', label: 'Click',     icon: '📲' },
  { id: 'uzum',  label: 'Uzum Pay',  icon: '🟠' },
]

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const DELIVERY_FEE = totalPrice >= 100000 ? 0 : 15000
  const DISCOUNT     = coupon?.discount || 0
  const TOTAL        = totalPrice + DELIVERY_FEE - DISCOUNT

  const [form, setForm]       = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
    note:    '',
    payment: 'cash',
  })
  const [loading, setLoading] = useState(false)
  const [coupon,  setCoupon]  = useState(null)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleOrder = async () => {
    if (!form.address.trim()) return toast.error('Manzilni kiriting')
    if (!form.phone.trim())   return toast.error('Telefon raqamni kiriting')

    setLoading(true)
    try {
      const payload = {
        items: items.map(i => ({
          product:  i._id,
          name:     i.name,
          emoji:    i.emoji,
          price:    i.price,
          quantity: i.quantity,
        })),
        address:       form.address,
        phone:         form.phone,
        paymentMethod: form.payment,
        note:          form.note,
      }
      const res = await ordersAPI.create(payload)
      clearCart()
      const orderId = res.data.data._id
      // Naqd pul bo'lsa orders ga, onlayn bo'lsa payment sahifasiga
      if (form.payment === 'cash') {
        toast.success('Buyurtma qabul qilindi! Kuryer tez orada keladi 🚀', { duration: 4000 })
        navigate('/orders')
      } else {
        toast.success('Buyurtma yaratildi! To\'lovga o\'tilmoqda...', { duration: 2000 })
        navigate(`/payment/${orderId}`)
      }
    } catch (err) {
      // Demo fallback — backend ulanganda o'chiring
      const demoId = 'demo_' + Date.now()
      clearCart()
      if (form.payment === 'cash') {
        toast.success('Buyurtma qabul qilindi! 🎉', { duration: 4000 })
        navigate('/orders')
      } else {
        toast.success('Buyurtma yaratildi! To\'lovga o\'tilmoqda...', { duration: 2000 })
        navigate(`/payment/${demoId}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🛒</span>
        <p className="text-gray-500">Savatchangiz bo'sh</p>
        <Link to="/" className="btn-primary">Xarid qilish</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">📋 Buyurtma berish</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-4">

            {/* Delivery info */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📍</span> Yetkazib berish ma'lumotlari
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ism-familiya</label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="To'liq ismingiz" className="input-field"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+998 90 000 00 00" className="input-field"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Manzil</label>
                  <textarea value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="Ko'cha, uy raqami, kvartira..." rows={2}
                    className="input-field resize-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Izoh (ixtiyoriy)</label>
                  <input type="text" value={form.note} onChange={e => set('note', e.target.value)}
                    placeholder="Masalan: 3-qavat, chap eshik" className="input-field"/>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎟️</span> Promokod
              </h2>
              <CouponInput
                orderTotal={totalPrice}
                onApply={setCoupon}
                appliedCoupon={coupon}
              />
            </div>

            {/* Payment */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span> To'lov usuli
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => set('payment', pm.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                      form.payment === pm.id
                        ? 'border-brand-green bg-brand-light text-brand-dark'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{pm.icon}</span>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-4">Buyurtma xulosasi</h2>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
                {items.map(i => (
                  <div key={i._id} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{i.emoji}</span>
                    <span className="flex-1 text-gray-700 truncate">{i.name}</span>
                    <span className="text-gray-500">×{i.quantity}</span>
                    <span className="font-medium text-gray-900 shrink-0">{formatPrice(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mahsulotlar:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {DISCOUNT > 0 && (
                  <div className="flex justify-between text-brand-green">
                    <span>Promokod:</span>
                    <span className="font-medium">-{formatPrice(DISCOUNT)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Yetkazib berish:</span>
                  <span className={DELIVERY_FEE === 0 ? 'text-brand-green font-medium' : ''}>
                    {DELIVERY_FEE === 0 ? 'Bepul 🎉' : formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                  <span>Jami:</span>
                  <span className="text-brand-green">{formatPrice(TOTAL)}</span>
                </div>
              </div>

              <button onClick={handleOrder} disabled={loading}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Joylashtirilmoqda...</span></>
                  : '✅ Buyurtma berish'
                }
              </button>

              <Link to="/cart" className="btn-ghost block text-center mt-2 py-1.5 text-sm">
                ← Savatga qaytish
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
