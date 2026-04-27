import { useCart } from '../context/CartContext'
import { formatPrice, discountedPrice } from '../data/mockData'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem, items, updateQty } = useCart()
  const cartItem = items.find(i => i._id === product._id)
  const finalPrice = discountedPrice(product.price, product.discount)

  const handleAdd = () => {
    addItem(product)
    toast.success(`${product.name} savatga qo'shildi`, {
      icon: '🛒',
      style: { borderRadius: '12px', fontSize: '14px' },
    })
  }

  return (
    <div className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
      {/* Product image area */}
      <div className="relative bg-gray-50 h-32 flex items-center justify-center text-5xl rounded-t-2xl">
        <span>{product.emoji}</span>
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 badge-red text-xs">
            -{product.discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-t-2xl">
            <span className="text-xs font-medium text-gray-500">Mavjud emas</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 mb-0.5 truncate">{product.name}</p>
        <p className="text-xs text-gray-400 mb-2">{product.unit}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand-green">{formatPrice(finalPrice)}</p>
            {product.discount > 0 && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
            )}
          </div>

          {/* Add / Quantity controls */}
          {cartItem ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQty(product._id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-base font-medium hover:bg-gray-200 transition-colors"
              >−</button>
              <span className="text-sm font-semibold w-5 text-center">{cartItem.quantity}</span>
              <button
                onClick={() => updateQty(product._id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-brand-green text-white flex items-center justify-center text-base font-medium hover:bg-brand-dark transition-colors"
              >+</button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center text-xl font-light hover:bg-brand-dark transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >+</button>
          )}
        </div>
      </div>
    </div>
  )
}
