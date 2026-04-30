import { CATEGORIES } from '../data/mockData'

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat._id}
              onClick={() => onChange(cat._id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                active === cat._id
                  ? 'bg-brand-green text-white border-brand-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
