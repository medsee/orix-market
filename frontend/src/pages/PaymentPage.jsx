import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { paymentAPI, ordersAPI } from '../data/api'
import { formatPrice } from '../data/mockData'
import toast from 'react-hot-toast'

// ── To'lov usullari ───────────────────────────────────────
const METHODS = [
  {
    id:    'payme',
    name:  'Payme',
    logo:  '💳',
    color: '#1AC8DB',
    desc:  'Payme ilovasi yoki karta orqali',
  },
  {
    id:    'click',
    name:  'Click',
    logo:  '📲',
    color: '#0099DE',
    desc:  'Click ilovasi yoki internet-banking',
  },
  {
    id:    'uzum',
    name:  'Uzum Pay',
    logo:  '🟠',
    color: '#FF5900',
    desc:  'Uzum bank ilovasi orqali',
  },
  {
    id:    'cash',
    name:  'Naqd pul',
    logo:  '💵',
    color: '#1D9E75',
    desc:  'Kuryer kelganida naqd to\'lang',
  },
]

// ── To'lov holat ikonkasi ─────────────────────────────────
function StatusIcon({ status }) {
  if (status === 'paid')      return <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto">✅</div>
  if (status === 'cancelled') return <div className="w-16 h-16 rounded-full bg-red-100   flex items-center justify-center text-3xl mx-auto">❌</div>
  return                             <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mx-auto animate-pulse">⏳</div>
}

export default function PaymentPage() {
  const { orderId }    = useParams()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()

  const [order,     setOrder]     = useState(null)
  const [selected,  setSelected]  = useState('payme')
  const [loading,   setLoading]   = useState(false)
  const [pageLoad,  setPageLoad]  = useState(true)
  const [payStatus, setPayStatus] = useState(null) // null | 'paid' | 'cancelled' | 'pending'

  // Buyurtma va to'lov holati yuklash
  useEffect(() => {
    const load = async () => {
      try {
        // Demo: mock order data agar backend yo'q bo'lsa
        const mockOrder = {
          _id:         orderId,
          totalPrice:  85000,
          deliveryFee: 15000,
          status:      'pending',
          paymentStatus: 'unpaid',
          items: [
            { name: 'Pomidor', emoji: '🍅', price: 6000,  quantity: 2 },
            { name: 'Sut',     emoji: '🥛', price: 12000, quantity: 1 },
            { name: "Go'sht",  emoji: '🥩', price: 42500, quantity: 1 },
          ],
          address: 'Toshkent sh., Chilonzor t., 5-uy',
          phone:   '+998901234567',
        }

        // Backend ulangan bo'lsa real data olamiz
        try {
          const [orderRes, statusRes] = await Promise.all([
            ordersAPI.getById(orderId),
            paymentAPI.getStatus(orderId),
          ])
          setOrder(orderRes.data.data)
          setPayStatus(statusRes.data.data.paymentStatus)
        } catch {
          setOrder(mockOrder)
          // URL da ?payment=success bo'lsa — to'lov muvaffaqiyatli
          if (searchParams.get('payment') === 'success') setPayStatus('paid')
          else setPayStatus('unpaid')
        }
      } finally {
        setPageLoad(false)
      }
    }
    load()
  }, [orderId])

  // To'lov URL ga redirect
  const handlePay = async () => {
    if (selected === 'cash') {
      toast.success("Buyurtma qabul qilindi! Kuryer naqd pul oladi 💵")
      navigate('/orders')
      return
    }

    setLoading(true)
    try {
      let url

      if (selected === 'payme') {
        const res = await paymentAPI.initPayme(orderId)
        url = res.data.url
      } else if (selected === 'click') {
        const res = await paymentAPI.initClick(orderId)
        url = res.data.url
      } else if (selected === 'uzum') {
        // Uzum Pay — hozircha demo
        toast('Uzum Pay tez orada qo\'shiladi!', { icon: '🟠' })
        setLoading(false)
        return
      }

      // To'lov sahifasiga o'tish
      window.location.href = url
    } catch (err) {
      // Demo rejimida mock URL
      const mockUrls = {
        payme: `https://checkout.test.paycom.uz/demo?amount=${(order.totalPrice + order.deliveryFee) * 100}`,
        click: `https://my.click.uz/services/pay?amount=${order.totalPrice + order.deliveryFee}`,
      }
      toast('Demo rejim: haqiqiy to\'lov URL kerak bo\'lsa .env ni sozlang', { icon: '⚠️', duration: 4000 })
      console.log('Mock to\'lov URL:', mockUrls[selected])
    } finally {
      setLoading(false)
    }
  }

  // Polling: to'lov holati tekshirish (5 sekund)
  useEffect(() => {
    if (payStatus === 'paid' || payStatus === 'cancelled' || !orderId) return
    const interval = setInterval(async () => {
      try {
        const res = await paymentAPI.getStatus(orderId)
        const status = res.data.data.paymentStatus
        if (status === 'paid' || status === 'cancelled') {
          setPayStatus(status)
          clearInterval(interval)
        }
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [orderId, payStatus])

  if (pageLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  // To'lov muvaffaqiyatli yoki bekor bo'ldi
  if (payStatus === 'paid' || payStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <StatusIcon status={payStatus} />
          <h1 className="text-xl font-bold mt-4 mb-2">
            {payStatus === 'paid' ? "To'lov muvaffaqiyatli!" : "To'lov bekor qilindi"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {payStatus === 'paid'
              ? "Buyurtmangiz qabul qilindi va tayyorlanmoqda 🚀"
              : "To'lov amalga oshmadi. Qayta urinib ko'ring."}
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/orders"        className="btn-primary py-2.5 block">Buyurtmalarimga o'tish</Link>
            {payStatus === 'cancelled' && (
              <button onClick={() => setPayStatus('unpaid')} className="btn-secondary py-2.5">Qayta to'lash</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const total = (order?.totalPrice || 0) + (order?.deliveryFee || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">💳 To'lov</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: payment method selector */}
          <div className="lg:col-span-3 space-y-3">
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">To'lov usulini tanlang</h2>
              <div className="space-y-2">
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      selected === m.id
                        ? 'border-brand-green bg-brand-light'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Radio */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected === m.id ? 'border-brand-green' : 'border-gray-300'
                    }`}>
                      {selected === m.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-green"/>
                      )}
                    </div>

                    {/* Logo */}
                    <span className="text-2xl">{m.logo}</span>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>

                    {selected === m.id && (
                      <span className="text-xs text-brand-green font-medium">Tanlandi ✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-lg shrink-0">🔒</span>
              <div>
                <p className="text-sm font-medium text-blue-900">Xavfsiz to'lov</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Barcha to'lovlar SSL shifrlash orqali himoyalangan. Karta ma'lumotlaringiz saqlanmaydi.
                </p>
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-4">Buyurtma #{orderId?.slice(-6)?.toUpperCase()}</h2>

              {order?.items?.length > 0 && (
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-base">{item.emoji}</span>
                      <span className="flex-1 text-gray-700 truncate">{item.name}</span>
                      <span className="text-gray-400 text-xs">×{item.quantity}</span>
                      <span className="font-medium text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mahsulotlar:</span>
                  <span>{formatPrice(order?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Yetkazib berish:</span>
                  <span className={(order?.deliveryFee || 0) === 0 ? 'text-brand-green' : ''}>
                    {(order?.deliveryFee || 0) === 0 ? 'Bepul' : formatPrice(order?.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                  <span>Jami:</span>
                  <span className="text-brand-green">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Yo'naltirilmoqda...</span></>
                  : selected === 'cash'
                    ? '✅ Buyurtmani tasdiqlash'
                    : `💳 ${METHODS.find(m => m.id === selected)?.name} orqali to'lash`
                }
              </button>

              <Link to="/checkout" className="btn-ghost block text-center mt-2 text-sm">
                ← Buyurtmaga qaytish
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
