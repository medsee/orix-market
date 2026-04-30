import { useState } from 'react'
import { CATEGORIES } from '../data/mockData'
import ImageUpload from './ImageUpload'

const EMPTY = {
  name: '', emoji: '📦', unit: '1 kg', price: '',
  category: 'vegetables', discount: 0, inStock: true,
  featured: false, description: '', image: '', imagePublicId: '',
}

export default function ProductModal({ product, onClose, onSave }) {
  const [form, setForm]       = useState(product || EMPTY)
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState('info') // 'info' | 'image'

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleImageUploaded = ({ url, publicId }) => {
    setForm(p => ({ ...p, image: url, imagePublicId: publicId || '' }))
  }

  const handleSave = async () => {
    if (!form.name || !form.price) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    onSave({ ...form, _id: product?._id || Date.now().toString(), price: Number(form.price) })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[{ id: 'info', label: '📋 Ma\'lumot' }, { id: 'image', label: '🖼️ Rasm' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Info tab */}
        {tab === 'info' && (
          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Emoji</label>
                <input type="text" value={form.emoji} onChange={e => set('emoji', e.target.value)}
                  className="input-field text-center text-2xl h-11"/>
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nomi *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Mahsulot nomi" className="input-field h-11"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Narx (so'm) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="12000" className="input-field"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">O'lchov birligi</label>
                <input type="text" value={form.unit} onChange={e => set('unit', e.target.value)}
                  placeholder="1 kg" className="input-field"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kategoriya</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                  {CATEGORIES.filter(c => c._id !== 'all').map(c => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Chegirma (%)</label>
                <input type="number" min="0" max="90" value={form.discount}
                  onChange={e => set('discount', Number(e.target.value))} className="input-field"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tavsif</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={2} placeholder="Mahsulot haqida..." className="input-field resize-none"/>
            </div>
            <div className="flex gap-4">
              {[{ key: 'inStock', label: 'Mavjud' }, { key: 'featured', label: 'Featured ⭐' }].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => set(key, !form[key])}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form[key] ? 'bg-brand-green' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Image tab */}
        {tab === 'image' && (
          <div className="p-5">
            <p className="text-sm text-gray-500 mb-3">
              Mahsulot rasmi yuklang. Rasm 800×800px ga crop qilinadi.
            </p>
            <ImageUpload
              productId={product?._id}
              currentImage={form.image}
              onUploadSuccess={handleImageUploaded}
            />
            {form.image && (
              <p className="text-xs text-brand-green mt-2 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Rasm yuklangan
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Bekor qilish</button>
          <button onClick={handleSave} disabled={loading || !form.name || !form.price}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Saqlanmoqda...</span></>
              : '💾 Saqlash'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
