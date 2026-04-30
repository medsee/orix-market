import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/mockData'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  const DELIVERY_FEE = totalPrice >= 100000 ? 0 : 15000
  const TOTAL = totalPrice + DELIVERY_FEE

  const handleOrder = () => {
    if (items.length === 0) return
    toast.success("Buyurtma muvaffaqiyatli joylashtirildi! 🎉")
    clearCart()
    navigate('/orders')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-6xl">🛒</span>
        <h2 className="text-xl font-bold text-gray-800">Savatchangiz bo'sh</h2>
        <p className="text-gray-500 text-sm">Biror mahsulot qo'shing va buyurtma bering</p>
        <Link to="/" className="btn-primary mt-2">Xarid qilishni boshlash</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          🛒 Savatcha
          <span className="ml-2 text-base font-normal text-gray-400">({totalItems} ta mahsulot)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item._id} className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.unit}</p>
                  <p className="text-sm font-bold text-brand-green mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQty(item._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-medium hover:bg-gray-200 transition-colors"
                  >−</button>
                  <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-brand-green text-white flex items-center justify-center text-lg font-medium hover:bg-brand-dark transition-colors"
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(item._id)}
                  className="text-gray-300 hover:text-red-400 transition-colors ml-1 shrink-0"
                  title="O'chirish"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Buyurtma xulosasi</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Mahsulotlar:</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Yetkazib berish:</span>
                <span className={`font-medium ${DELIVERY_FEE === 0 ? 'text-brand-green' : ''}`}>
                  {DELIVERY_FEE === 0 ? 'Bepul' : formatPrice(DELIVERY_FEE)}
                </span>
              </div>
              {DELIVERY_FEE > 0 && (
                <p className="text-xs text-gray-400">100 000 so'mdan yuqori buyurtmada yetkazib berish bepul</p>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                <span>Jami:</span>
                <span className="text-brand-green">{formatPrice(TOTAL)}</span>
              </div>
            </div>

            <button onClick={handleOrder} className="btn-primary w-full justify-center py-3 text-base">
              Buyurtma berish
            </button>
            <Link to="/" className="btn-ghost w-full justify-center mt-2 text-center block py-2">
              ← Xaridni davom ettirish
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
