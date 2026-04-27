import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI, ordersAPI } from '../data/api'
import { PRODUCTS } from '../data/mockData'
import { formatPrice } from '../data/mockData'

const MOCK_STATS = {
  totalOrders:   142,
  totalRevenue:  18750000,
  totalProducts: 16,
  pendingOrders: 7,
}

const MOCK_ORDERS = [
  { id: 'ORX-1042', customer: 'Alisher Karimov', phone: '+998901234567', total: 85000, status: 'pending',    date: '2025-04-28', items: 3 },
  { id: 'ORX-1041', customer: 'Dilnoza Yusupova', phone: '+998907654321', total: 42000, status: 'processing', date: '2025-04-28', items: 2 },
  { id: 'ORX-1040', customer: 'Sardor Toshmatov', phone: '+998901111111', total: 120000,status: 'delivered',  date: '2025-04-27', items: 5 },
  { id: 'ORX-1039', customer: 'Malika Rahimova',  phone: '+998902222222', total: 35000, status: 'cancelled',  date: '2025-04-27', items: 1 },
  { id: 'ORX-1038', customer: 'Jasur Nazarov',    phone: '+998903333333', total: 67000, status: 'delivered',  date: '2025-04-26', items: 4 },
]

const STATUS_CONFIG = {
  pending:    { label: "Kutilmoqda",   cls: 'bg-amber-50  text-amber-700  border-amber-200' },
  processing: { label: "Yo'lda",       cls: 'bg-blue-50   text-blue-700   border-blue-200' },
  delivered:  { label: 'Yetkazildi',   cls: 'bg-green-50  text-green-700  border-green-200' },
  cancelled:  { label: 'Bekor qilindi',cls: 'bg-red-50    text-red-700    border-red-200' },
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-brand-green mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [orders, setOrders]   = useState(MOCK_ORDERS)
  const [tab, setTab]         = useState('orders')
  const [products, setProducts] = useState(PRODUCTS)

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o._id === id || o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Admin Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="7" cy="6" r="2" fill="white"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
              <circle cx="17" cy="18" r="2" fill="white"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm">Orix Market</span>
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Admin panel</span>
          </div>
        </div>
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          Saytga o'tish
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="📦" label="Jami buyurtmalar"  value={MOCK_STATS.totalOrders}                         color="bg-blue-50"   sub="+12 bugun" />
          <StatCard icon="💰" label="Jami daromad"      value={formatPrice(MOCK_STATS.totalRevenue)}           color="bg-green-50"  sub="+8% bu oy" />
          <StatCard icon="🛍️" label="Mahsulotlar soni"  value={MOCK_STATS.totalProducts}                       color="bg-purple-50" />
          <StatCard icon="⏳" label="Kutilayotgan"       value={MOCK_STATS.pendingOrders}                       color="bg-amber-50"  sub="Tezkor amal talab qiladi" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {[
            { id: 'orders',   label: '📋 Buyurtmalar' },
            { id: 'products', label: '🛍️ Mahsulotlar' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">So'nggi buyurtmalar</h2>
              <span className="text-xs text-gray-400">{orders.length} ta</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['ID', 'Mijoz', 'Telefon', "Summa", "Mahsulot", 'Status', 'Sana', 'Amal'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{order.customer}</td>
                      <td className="px-4 py-3 text-gray-500">{order.phone}</td>
                      <td className="px-4 py-3 font-semibold text-brand-green">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3 text-gray-500">{order.items} ta</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[order.status].cls}`}>
                          {STATUS_CONFIG[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{order.date}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green"
                        >
                          <option value="pending">Kutilmoqda</option>
                          <option value="processing">Yo'lda</option>
                          <option value="delivered">Yetkazildi</option>
                          <option value="cancelled">Bekor qilindi</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                onClick={() => alert('Mahsulot qo\'shish modali — keyingi bosqichda!')}
                className="btn-primary flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Yangi mahsulot
              </button>
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Mahsulot', 'Kategoriya', 'Narx', "Chegirma", 'Holat', 'Featured', 'Amal'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{p.emoji}</span>
                            <div>
                              <p className="font-medium text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{p.category}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3">
                          {p.discount > 0
                            ? <span className="badge-red">-{p.discount}%</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {p.inStock ? '● Mavjud' : '● Tugagan'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.featured
                            ? <span className="text-amber-500 text-base">⭐</span>
                            : <span className="text-gray-300 text-base">☆</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 text-gray-400 hover:text-brand-green hover:bg-green-50 rounded-lg transition-colors" title="Tahrirlash">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => setProducts(prev => prev.filter(x => x._id !== p._id))}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="O'chirish">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
