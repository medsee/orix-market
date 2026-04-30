import { useState, useEffect } from 'react'
import { smsAPI } from '../data/api'
import toast from 'react-hot-toast'
import { SMS_TEMPLATES_PREVIEW } from '../data/smsTemplates'

export default function SmsTestPanel() {
  const [phone,   setPhone]   = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status,  setStatus]  = useState(null) // { enabled, mode }
  const [tab,     setTab]     = useState('custom') // 'custom' | 'templates'

  useEffect(() => {
    smsAPI.testSMS('', '').catch(() => {}) // status probe
    // In demo we just set defaults
    setStatus({ enabled: false, mode: 'demo (log only)', provider: 'Eskiz.uz' })
  }, [])

  const handleSend = async () => {
    if (!phone) return toast.error('Telefon raqamni kiriting')
    if (!message) return toast.error('Xabar matnini kiriting')
    setSending(true)
    try {
      await smsAPI.testSMS(phone, message)
      toast.success('SMS yuborildi ✅')
    } catch {
      toast('Demo rejim — haqiqiy SMS uchun Eskiz sozlang', { icon: '⚠️' })
    } finally {
      setSending(false)
    }
  }

  const useTemplate = (text) => {
    setMessage(text)
    setTab('custom')
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>📱</span> SMS Bildirish
        </h2>
        {status && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            status.enabled
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {status.enabled ? '● Yoqilgan' : '○ Demo rejim'}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-4">
        {[
          { id: 'custom',    label: '✏️ Maxsus xabar' },
          { id: 'templates', label: '📋 Shablonlar' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'custom' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Telefon raqam</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🇺🇿</span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+998 90 000 00 00" className="input-field pl-10 text-sm"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Xabar matni
              <span className={`ml-2 ${message.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                {message.length}/160
              </span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="SMS xabar matni..."
              className="input-field resize-none text-sm"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !phone || !message}
            className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
          >
            {sending
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Yuborilmoqda...</span></>
              : '📤 SMS yuborish'
            }
          </button>
        </div>
      )}

      {tab === 'templates' && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {SMS_TEMPLATES_PREVIEW.map((t, i) => (
            <div key={i} className="p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700 mb-1">{t.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.preview}</p>
                </div>
                <button
                  onClick={() => useTemplate(t.preview)}
                  className="shrink-0 text-xs text-brand-green hover:underline font-medium"
                >
                  Ishlatish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!status?.enabled && (
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Haqiqiy SMS uchun .env da SMS_ENABLED=true va Eskiz kredensiалlarini kiriting
        </p>
      )}
    </div>
  )
}
