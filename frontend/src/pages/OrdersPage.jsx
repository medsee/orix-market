import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../data/api'
import { formatPrice } from '../data/mockData'
import OrderTracker from '../components/OrderTracker'
import PaymentStatus from '../components/PaymentStatus'

const STATUS_CONFIG = {
  pending:    { label: 'Kutilmoqda',     cls: 'bg-amber-50  text-amber-700  border border-amber-200'  },
  processing: { label: 'Tayyorlanmoqda', cls: 'bg-blue-50   text-blue-700   border border-blue-200'   },
  on_the_way: { label: "Yo'lda",         cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
  delivered:  { label: 'Yetkazildi',    cls: 'bg-green-50  text-green-700  border border-green-200'  },
  cancelled:  { label: 'Bekor qilindi', cls: 'bg-red-50    text-red-700    border border-red-200'    },
}

const DEMO_ORDERS = [
  {
    _id: 'demo_1', createdAt: new Date(Date.now() - 10*60*1000).toISOString(),
    status: 'on_the_way', paymentStatus: 'paid', paymentMethod: 'payme',
    totalPrice: 85000, deliveryFee: 0,
    items: [{ name: 'Pomidor', emoji: '🍅', price: 6000, quantity: 2 }, { name: "Go'sht", emoji: '🥩', price: 42500, quantity: 1 }],
  },
  {
    _id: 'demo_2', createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
    status: 'delivered', paymentStatus: 'paid', paymentMethod: 'click',
    totalPrice: 42000, deliveryFee: 15000,
    items: [{ name: 'Sut', emoji: '🥛', price: 12000, quantity: 1 }, { name: 'Tuxum', emoji: '🥚', price: 22000, quantity: 1 }],
  },
]

export default function OrdersPage() {
  const [orders,   setOrders]   = useState(DEMO_ORDERS)
  const [selected, setSelected] = useState(DEMO_ORDERS[0]?._id || null)

  useEffect(() => {
    ordersAPI.getMyOrders()
      .then(res => { if (res.data.data?.length) { setOrders(res.data.data); setSelected(res.data.data[0]?._id) } })
      .catch(() => {})
  }, [])

  const activeOrder = orders.find(o => o._id === selected)

  if (!orders.length) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-6xl">📦</span>
      <h2 className="text-xl font-bold text-gray-800">Buyurtmalar yo'q</h2>
      <Link to="/" className="btn-primary mt-2">Xarid qilish</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">📦 Buyurtmalarim</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          <div className="lg:col-span-2 space-y-2">
            {orders.map(order => {
              const cfg      = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const isActive = order._id === selected
              return (
                <button key={order._id} onClick={() => setSelected(order._id)}
                  className={`w-full text-left card p-4 transition-all ${isActive ? 'border-brand-green ring-1 ring-brand-green/20' : 'hover:shadow-md'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs font-mono text-gray-500">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(order.totalPrice + (order.deliveryFee || 0))}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {order.items?.slice(0,3).map((item,i) => <span key={i} className="text-sm">{item.emoji}</span>)}
                    {order.items?.length > 3 && <span className="text-xs text-gray-400">+{order.items.length-3}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('uz-UZ')}</p>
                    <PaymentStatus status={order.paymentStatus} orderId={order._id} showPayBtn />
                  </div>
                </button>
              )
            })}
          </div>

          {activeOrder && (
            <div className="lg:col-span-3 space-y-4">
              <OrderTracker orderId={activeOrder._id} initialStatus={activeOrder.status} showHistory />
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Buyurtma tafsiloti</h3>
                <div className="space-y-2 mb-4">
                  {activeOrder.items?.map((item,i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="flex-1 text-gray-700">{item.name}</span>
                      <span className="text-gray-400 text-xs">×{item.quantity}</span>
                      <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Mahsulotlar:</span><span>{formatPrice(activeOrder.totalPrice)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Yetkazib berish:</span>
                    <span className={(activeOrder.deliveryFee||0)===0?'text-brand-green':''}>{(activeOrder.deliveryFee||0)===0?'Bepul':formatPrice(activeOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                    <span>Jami:</span>
                    <span className="text-brand-green">{formatPrice(activeOrder.totalPrice+(activeOrder.deliveryFee||0))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
