import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { PRODUCTS, formatPrice } from '../data/mockData'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile',   label: '👤 Ma\'lumotlar' },
  { id: 'addresses', label: '📍 Manzillar'    },
  { id: 'favorites', label: '❤️ Sevimlilar'   },
  { id: 'history',   label: '📦 Tarix'         },
]

const SAVED_ADDRESSES = [
  { id: 1, label: 'Uy',   address: 'Toshkent, Chilonzor t., 5-ko\'cha 12-uy', isDefault: true  },
  { id: 2, label: 'Ish',  address: 'Toshkent, Yunusobod t., Amir Temur 108', isDefault: false },
]

const FAVORITES = PRODUCTS.slice(0, 4)

const HISTORY = [
  { id: 'ORX-1042', date: '28.04.2025', total: 85000,  status: 'delivered',  items: ['🍅','🥛','🥩'] },
  { id: 'ORX-1038', date: '22.04.2025', total: 42000,  status: 'delivered',  items: ['🥚','🍞']       },
  { id: 'ORX-1031', date: '15.04.2025', total: 120000, status: 'delivered',  items: ['🥩','🍗','🥦'] },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { addItem }      = useCart()
  const [tab,     setTab]     = useState('profile')
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    toast.success('Profil yangilandi ✅')
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header card */}
        <div className="card p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center text-xl font-bold text-white shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{user?.name || 'Foydalanuvchi'}</p>
            <p className="text-sm text-gray-500">{user?.phone}</p>
            {user?.role === 'admin' && (
              <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
            )}
          </div>
          <button onClick={logout} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Chiqish
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Ma'lumotlar tab ── */}
        {tab === 'profile' && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Shaxsiy ma'lumotlar</h2>
              <button onClick={() => setEditing(p => !p)} className="text-sm text-brand-green hover:underline">
                {editing ? 'Bekor' : 'Tahrirlash'}
              </button>
            </div>
            {editing ? (
              <div className="space-y-3">
                {[['name','Ism','Ismingiz'],['phone','Telefon','+998...'],['address','Manzil','Ko\'cha, uy...']]
                  .map(([k, label, ph]) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input type="text" value={form[k]} onChange={e => set(k, e.target.value)}
                      placeholder={ph} className="input-field"/>
                  </div>
                ))}
                <button onClick={handleSave} className="btn-primary w-full py-2.5">💾 Saqlash</button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  ['Ism',     user?.name    || '—'],
                  ['Telefon', user?.phone   || '—'],
                  ['Manzil',  user?.address || 'Qo\'shilmagan'],
                  ['Rol',     user?.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Manzillar tab ── */}
        {tab === 'addresses' && (
          <div className="space-y-3">
            {SAVED_ADDRESSES.map(addr => (
              <div key={addr.id} className={`card p-4 flex items-start gap-3 ${addr.isDefault ? 'border-brand-green/30 border' : ''}`}>
                <span className="text-xl mt-0.5">📍</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">{addr.label}</p>
                    {addr.isDefault && <span className="text-xs bg-brand-light text-brand-dark px-2 py-0.5 rounded-full">Asosiy</span>}
                  </div>
                  <p className="text-sm text-gray-500">{addr.address}</p>
                </div>
                <button className="text-gray-300 hover:text-red-400 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => toast('Manzil qo\'shish — keyingi versiyada!', { icon: '🚧' })}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Yangi manzil qo'shish
            </button>
          </div>
        )}

        {/* ── Sevimlilar tab ── */}
        {tab === 'favorites' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {FAVORITES.map(p => (
              <div key={p._id} className="card overflow-hidden group">
                <div className="h-24 bg-gray-50 flex items-center justify-center text-4xl">
                  {p.emoji}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mb-2">{p.unit}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brand-green">{formatPrice(p.price)}</span>
                    <button onClick={() => { addItem(p); toast.success(`${p.name} savatga qo'shildi`) }}
                      className="w-7 h-7 rounded-lg bg-brand-green text-white flex items-center justify-center text-base hover:bg-brand-dark transition-colors">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tarix tab ── */}
        {tab === 'history' && (
          <div className="space-y-3">
            {HISTORY.map(o => (
              <div key={o.id} className="card p-4 flex items-center gap-4">
                <div className="flex gap-0.5 shrink-0">
                  {o.items.map((e, i) => <span key={i} className="text-xl">{e}</span>)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-gray-500">{o.id}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(o.total)}</p>
                  <p className="text-xs text-gray-400">{o.date}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    Yetkazildi
                  </span>
                  <button
                    onClick={() => toast('Qayta buyurtma berildi! 🛒', { icon: '✅' })}
                    className="text-xs text-brand-green hover:underline">
                    Qayta buyurtma
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
