import { Link } from 'react-router-dom'

export default function HeroBanner() {
  const highlights = [
    { emoji: '🥦', name: 'Brokoli',   price: '8 500 so\'m' },
    { emoji: '🍅', name: 'Pomidor',   price: '6 000 so\'m' },
    { emoji: '🥛', name: 'Sut',       price: '12 000 so\'m' },
    { emoji: '🥩', name: 'Go\'sht',   price: '85 000 so\'m' },
  ]

  return (
    <section className="bg-primary-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Left copy */}
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-1.5 bg-brand-green text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Toshkent bo'ylab 60 daqiqada yetkazib berish
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-800 leading-tight mb-3">
            Yangi va sifatli mahsulotlar{' '}
            <span className="text-brand-green">eshigingizgacha</span>
          </h1>
          <p className="text-primary-500 text-base mb-6 leading-relaxed">
            Meva-sabzavot, go'sht, sut mahsulotlari va yana ko'plab mahsulotlar — qulay narxda, tez yetkazib berish bilan.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.51L23 6H6"/>
              </svg>
              Buyurtma berish
            </Link>
            <Link to="/products" className="btn-secondary">
              Katalogni ko'rish →
            </Link>
          </div>

          {/* Delivery info strip */}
          <div className="flex gap-4 mt-6 flex-wrap">
            {[
              { icon: '⚡', text: '60 daqiqada' },
              { icon: '🏷️', text: 'Eng arzon narxlar' },
              { icon: '🔄', text: 'Qaytarish kafolati' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-1.5 text-sm text-primary-500">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right product grid */}
        <div className="grid grid-cols-2 gap-3">
          {highlights.map(item => (
            <div key={item.name} className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
              <span className="text-4xl">{item.emoji}</span>
              <p className="text-sm font-semibold text-gray-800">{item.name}</p>
              <p className="text-xs font-bold text-brand-green">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
