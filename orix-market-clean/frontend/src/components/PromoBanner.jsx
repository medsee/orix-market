import { Link } from 'react-router-dom'

const PROMOS = [
  {
    id: 1,
    tag: 'HAFTALIK AKSIYA',
    title: 'Meva-sabzavotlarda 20% chegirma',
    subtitle: 'Faqat 27–30 aprel kunlari. Minimal buyurtma: 100 000 so\'m',
    emoji: '🎉',
    bg: 'bg-amber-50',
    tagBg: 'bg-amber-100 text-amber-800',
    titleColor: 'text-amber-900',
    subColor: 'text-amber-700',
    href: '/products?category=vegetables',
  },
  {
    id: 2,
    tag: 'YANGI MAHSULOTLAR',
    title: 'Yangi go\'sht mahsulotlari keldi!',
    subtitle: 'Mol, qo\'y va tovuq go\'shtlari — kunlik yangi yetkazib berish',
    emoji: '🥩',
    bg: 'bg-red-50',
    tagBg: 'bg-red-100 text-red-800',
    titleColor: 'text-red-900',
    subColor: 'text-red-700',
    href: '/products?category=meat',
  },
]

export default function PromoBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PROMOS.map(p => (
        <Link
          key={p.id}
          to={p.href}
          className={`${p.bg} rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow`}
        >
          <div>
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 ${p.tagBg}`}>
              {p.tag}
            </span>
            <h3 className={`text-base font-bold mb-1 ${p.titleColor}`}>{p.title}</h3>
            <p className={`text-xs leading-relaxed ${p.subColor}`}>{p.subtitle}</p>
          </div>
          <span className="text-5xl ml-4 shrink-0">{p.emoji}</span>
        </Link>
      ))}
    </div>
  )
}
