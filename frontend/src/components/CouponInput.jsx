import { useState } from 'react'
import api from '../data/api'
import toast from 'react-hot-toast'

const formatPrice = n => new Intl.NumberFormat('uz-UZ').format(n) + " so'm"

export default function CouponInput({ orderTotal = 0, onApply, appliedCoupon }) {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)

  const handleValidate = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return toast.error('Promokod kiriting')
    setLoading(true)
    try {
      const res = await api.post('/api/coupons/validate', { code: trimmed, orderTotal })
      const d   = res.data.data
      toast.success(`Promokod qo'llandi! -${formatPrice(d.discount)}`)
      onApply?.(d)
      setCode('')
    } catch (err) {
      toast.error(err.response?.data?.message || "Noto'g'ri promokod")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    onApply?.(null)
    toast('Promokod olib tashlandi', { icon: '✕' })
  }

  if (appliedCoupon) return (
    <div className="flex items-center justify-between p-3 bg-brand-light border border-brand-green/30 rounded-xl">
      <div className="flex items-center gap-2">
        <span className="text-base">🎟️</span>
        <div>
          <p className="text-sm font-medium text-brand-dark">{appliedCoupon.code}</p>
          <p className="text-xs text-gray-600">-{formatPrice(appliedCoupon.discount)} chegirma</p>
        </div>
      </div>
      <button onClick={handleRemove}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
        Olib tashlash
      </button>
    </div>
  )

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && handleValidate()}
        placeholder="Promokod kiriting"
        className="input-field flex-1 uppercase tracking-widest text-sm font-mono"
      />
      <button
        onClick={handleValidate}
        disabled={loading || !code.trim()}
        className="btn-secondary px-4 py-2 text-sm shrink-0 flex items-center gap-1.5"
      >
        {loading
          ? <div className="w-3.5 h-3.5 border-2 border-brand-green border-t-transparent rounded-full animate-spin"/>
          : '🎟️'
        }
        Qo'llash
      </button>
    </div>
  )
}
