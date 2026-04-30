import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import { PRODUCTS } from '../data/mockData'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const initCategory = searchParams.get('category') || 'all'
  const initSearch   = searchParams.get('search')   || ''

  const [category, setCategory] = useState(initCategory)
  const [search, setSearch]     = useState(initSearch)
  const [sort, setSort]         = useState('default')

  const filtered = useMemo(() => {
    let list = [...PRODUCTS]
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (search)             list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'price_asc')  list.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'discount')   list.sort((a, b) => b.discount - a.discount)
    return list
  }, [category, search, sort])

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryFilter active={category} onChange={setCategory} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Search & Sort toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Mahsulot qidiring..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field w-auto"
          >
            <option value="default">Saralash</option>
            <option value="price_asc">Narx: arzondan qimmatga</option>
            <option value="price_desc">Narx: qimmatdan arzonga</option>
            <option value="discount">Chegirma bo'yicha</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">{filtered.length} ta mahsulot topildi</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-base font-medium">Mahsulot topilmadi</p>
            <p className="text-sm mt-1">Boshqa kalit so'z yoki kategoriya tanlang</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
