import { useState, useEffect } from 'react'
import api from '../data/api'
import toast from 'react-hot-toast'

const fmt = n => new Intl.NumberFormat('uz-UZ').format(n)
const EMPTY = { code: '', type: 'percent', value: '', minOrder: 0, maxDiscount: '', usageLimit: '', expiresAt: '', description: '', isActive: true }

function CouponForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.code || !form.value) return toast.error('Kod va qiymat kerak')
    try {
      const payload = {
        ...form,
        value:       Number(form.value),
        minOrder:    Number(form.minOrder) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit:  form.usageLimit  ? Number(form.usageLimit)  : null,
        expiresAt:   form.expiresAt   || null,
      }
      if (initial?._id) {
        await api.patch(`/api/coupons/${initial._id}`, payload)
        toast.success('Kupon yangilandi')
      } else {
        await api.post('/api/coupons', payload)
        toast.success('Kupon yaratildi')
      }
      onSave?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato')
    }
  }

  return (
    <div className="card p-5 mb-4">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">{initial?._id ? 'Tahrirlash' : 'Yangi promokod'}</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kod *</label>
          <input type="text" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="YANGI10" className="input-field font-mono uppercase tracking-widest text-sm"/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Turi</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
            <option value="percent">Foiz (%)</option>
            <option value="fixed">Summa (so'm)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Qiymat * {form.type === 'percent' ? '(%)' : "(so'm)"}
          </label>
          <input type="number" value={form.value} onChange={e => set('value', e.target.value)}
            placeholder={form.type === 'percent' ? '10' : '20000'} className="input-field"/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Min buyurtma (so'm)</label>
          <input type="number" value={form.minOrder} onChange={e => set('minOrder', e.target.value)}
            placeholder="50000" className="input-field"/>
        </div>
        {form.type === 'percent' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max chegirma (so'm)</label>
            <input type="number" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)}
              placeholder="50000" className="input-field"/>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Foydalanish limiti</label>
          <input type="number" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)}
            placeholder="Cheksiz" className="input-field"/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Amal qilish muddati</label>
          <input type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)}
            className="input-field"/>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Tavsif</label>
          <input type="text" value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Birinchi buyurtmada 10% chegirma" className="input-field"/>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1 py-2 text-sm">Bekor</button>
        <button onClick={handleSubmit} className="btn-primary flex-1 py-2 text-sm">💾 Saqlash</button>
      </div>
    </div>
  )
}

export default function CouponManager() {
  const [coupons,  setCoupons]  = useState([])
  const [editing,  setEditing]  = useState(null) // null | 'new' | coupon
  const [loading,  setLoading]  = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/coupons')
      setCoupons(res.data.data)
    } catch {
      // Demo data
      setCoupons([
        { _id: '1', code: 'YANGI10',  type: 'percent', value: 10, minOrder: 50000,  usedCount: 23, usageLimit: null, isActive: true,  expiresAt: null },
        { _id: '2', code: 'SUMMER20', type: 'percent', value: 20, minOrder: 100000, usedCount: 8,  usageLimit: 50,   isActive: true,  expiresAt: '2025-08-31' },
        { _id: '3', code: 'FLAT15K',  type: 'fixed',   value: 15000, minOrder: 80000, usedCount: 5, usageLimit: 100, isActive: false, expiresAt: null },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (coupon) => {
    try {
      await api.patch(`/api/coupons/${coupon._id}`, { isActive: !coupon.isActive })
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
    } catch { toast.error('Xato') }
  }

  const deleteCoupon = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    try {
      await api.delete(`/api/coupons/${id}`)
      setCoupons(prev => prev.filter(c => c._id !== id))
      toast.success("O'chirildi")
    } catch { toast.error('Xato') }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">🎟️ Promokodlar</h2>
        <button onClick={() => setEditing('new')} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yangi promokod
        </button>
      </div>

      {editing && (
        <CouponForm
          initial={editing === 'new' ? null : editing}
          onSave={() => { setEditing(null); load() }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="card overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🎟️</p>
            <p className="text-sm">Promokodlar yo'q</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Kod', 'Turi', 'Chegirma', 'Min buyurtma', 'Ishlatilgan', 'Muddat', 'Holat', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 text-sm">{c.code}</td>
                    <td className="px-4 py-3 text-gray-500">{c.type === 'percent' ? 'Foiz' : 'Summa'}</td>
                    <td className="px-4 py-3 font-semibold text-brand-green">
                      {c.type === 'percent' ? `${c.value}%` : `${fmt(c.value)} so'm`}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{fmt(c.minOrder)} so'm</td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''} marta
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('uz-UZ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium border transition-colors ${
                          c.isActive
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                        }`}>
                        {c.isActive ? 'Faol' : 'Nofaol'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(c)}
                          className="p-1.5 text-gray-400 hover:text-brand-green hover:bg-green-50 rounded-lg transition-colors">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => deleteCoupon(c._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
