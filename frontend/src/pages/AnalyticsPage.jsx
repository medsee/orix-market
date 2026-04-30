import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const fmt  = n => new Intl.NumberFormat('uz-UZ').format(n)
const fmtM = n => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1_000 ? (n/1_000).toFixed(0)+'K' : n

// Demo ma'lumotlar (backend ulanganda API dan keladi)
const DAILY = [
  { day: 'Du',  orders: 12, revenue: 1_020_000 },
  { day: 'Se',  orders: 18, revenue: 1_530_000 },
  { day: 'Ch',  orders: 9,  revenue:   765_000 },
  { day: 'Pa',  orders: 24, revenue: 2_040_000 },
  { day: 'Ju',  orders: 31, revenue: 2_635_000 },
  { day: 'Sh',  orders: 42, revenue: 3_570_000 },
  { day: 'Ya',  orders: 28, revenue: 2_380_000 },
]
const TOP_PRODUCTS = [
  { name: 'Mol go\'shti',  emoji: '🥩', sold: 284, revenue: 12_070_000 },
  { name: 'Pomidor',       emoji: '🍅', sold: 521, revenue:  3_126_000 },
  { name: 'Tovuq',         emoji: '🍗', sold: 318, revenue:  8_904_000 },
  { name: 'Sut (Lactel)',  emoji: '🥛', sold: 412, revenue:  4_944_000 },
  { name: 'Tuxum',         emoji: '🥚', sold: 267, revenue:  5_874_000 },
]
const STATS = {
  totalRevenue:  13_940_000,
  totalOrders:   164,
  avgOrder:       85_000,
  newUsers:        38,
  revenueGrowth: +24,
  ordersGrowth:  +18,
}

// Mini bar chart (SVG)
function BarChart({ data, valueKey, color = '#1D9E75' }) {
  const max = Math.max(...data.map(d => d[valueKey]))
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${(d[valueKey] / max) * 100}%`, background: color, minHeight: 4, opacity: 0.85 + (i / data.length) * 0.15 }}
          />
          <span className="text-xs text-gray-400">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

// Metric card
function StatCard({ icon, label, value, growth, color = 'bg-gray-50' }) {
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-lg mb-3`}>{icon}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {growth !== undefined && (
        <p className={`text-xs font-medium mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% o'tgan haftaga nisbatan
        </p>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('week') // week | month | year

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="7" cy="6" r="2" fill="white"/><circle cx="12" cy="12" r="2" fill="white"/>
              <circle cx="17" cy="18" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-sm">Orix Market</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Analitika</span>
        </div>
        <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-800">← Admin panel</Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Period selector */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">📊 Analitika</h1>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[['week','Hafta'],['month','Oy'],['year','Yil']].map(([v,l]) => (
              <button key={v} onClick={() => setPeriod(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  period === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="💰" label="Jami daromad"    value={`${fmtM(STATS.totalRevenue)} so'm`} growth={STATS.revenueGrowth} color="bg-green-50"/>
          <StatCard icon="📦" label="Buyurtmalar"     value={STATS.totalOrders}  growth={STATS.ordersGrowth}  color="bg-blue-50"/>
          <StatCard icon="🧾" label="O'rtacha buyurtma" value={`${fmtM(STATS.avgOrder)} so'm`}  color="bg-purple-50"/>
          <StatCard icon="👤" label="Yangi foydalanuvchi" value={STATS.newUsers} color="bg-amber-50"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Revenue chart */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Daromad (so'm)</h2>
              <span className="text-xs text-brand-green font-medium">
                Jami: {fmt(DAILY.reduce((s,d) => s+d.revenue, 0))} so'm
              </span>
            </div>
            <BarChart data={DAILY} valueKey="revenue" color="#1D9E75"/>
          </div>

          {/* Orders chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Buyurtmalar</h2>
              <span className="text-xs text-blue-600 font-medium">
                {DAILY.reduce((s,d) => s+d.orders, 0)} ta
              </span>
            </div>
            <BarChart data={DAILY} valueKey="orders" color="#378ADD"/>
          </div>
        </div>

        {/* Top products */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">⭐ Top mahsulotlar</h2>
            <span className="text-xs text-gray-400">bu hafta</span>
          </div>
          <div className="divide-y divide-gray-50">
            {TOP_PRODUCTS.map((p, i) => {
              const maxRevenue = TOP_PRODUCTS[0].revenue
              const pct = Math.round((p.revenue / maxRevenue) * 100)
              return (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-300 w-5 text-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xl shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-sm font-bold text-brand-green shrink-0 ml-2">{fmtM(p.revenue)} so'm</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-brand-green rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}/>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{fmt(p.sold)} ta</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
