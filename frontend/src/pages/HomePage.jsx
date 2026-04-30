import { useState, useMemo } from 'react'
import HeroBanner from '../components/HeroBanner'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import PromoBanner from '../components/PromoBanner'
import { PRODUCTS } from '../data/mockData'

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const featured = useMemo(() => PRODUCTS.filter(p => p.featured), [])
  const filtered  = useMemo(
    () => activeCategory === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory),
    [activeCategory]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroBanner />
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Featured section — shown only on "Barchasi" */}
        {activeCategory === 'all' && (
          <section className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">⭐ Mashhur mahsulotlar</h2>
              <button
                onClick={() => setActiveCategory('all')}
                className="text-sm text-brand-green font-medium hover:underline"
              >
                Barchasini ko'rish →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* Promo banners */}
        {activeCategory === 'all' && (
          <div className="px-0">
            <PromoBanner />
          </div>
        )}

        {/* All / filtered products */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {activeCategory === 'all' ? '🛍️ Barcha mahsulotlar' : `🔍 Natijalar (${filtered.length})`}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-base font-medium">Bu kategoriyada mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
