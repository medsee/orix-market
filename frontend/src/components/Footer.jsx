import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-brand-green flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="7" cy="6" r="2" fill="white"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
                <circle cx="17" cy="18" r="2" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-base">Orix<span className="text-brand-green"> Market</span></span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            O'zbekistondagi eng tez va ishonchli oziq-ovqat yetkazib berish platformasi.
          </p>
          <p className="text-xs text-gray-400 mt-3">© 2025 Orix Market. Barcha huquqlar himoyalangan.</p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-800">Havolalar</h4>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Bosh sahifa',    to: '/' },
              { label: 'Katalog',        to: '/products' },
              { label: 'Buyurtmalarim',  to: '/orders' },
              { label: 'Savatcha',       to: '/cart' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="text-sm text-gray-500 hover:text-brand-green transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Payment & contact */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-800">To'lov usullari</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Payme', 'Click', 'Uzum Pay', 'Naqd'].map(p => (
              <span key={p} className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 bg-gray-50">
                {p}
              </span>
            ))}
          </div>
          <h4 className="text-sm font-semibold mb-1 text-gray-800">Aloqa</h4>
          <p className="text-sm text-gray-500">📞 +998 71 200 00 00</p>
          <p className="text-sm text-gray-500">📍 Toshkent, O'zbekiston</p>
        </div>
      </div>
    </footer>
  )
}
