import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PhoneVerify from '../components/PhoneVerify'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState({ name: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleNext = () => {
    if (!form.name.trim())              return toast.error('Ismni kiriting')
    if (!form.phone.trim())             return toast.error('Telefon raqamni kiriting')
    if (form.password.length < 6)       return toast.error('Parol kamida 6 belgi')
    if (form.password !== form.confirm) return toast.error('Parollar mos kelmadi')
    setStep(2)
  }

  const handleVerified = async () => {
    setLoading(true)
    try {
      const user = await register(form.name, form.phone, form.password)
      setStep(3)
      setTimeout(() => { toast.success(`Xush kelibsiz, ${user.name}!`); navigate('/') }, 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || "Ro'yxatdan o'tishda xato")
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center mx-auto mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="7" cy="6" r="2" fill="white"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
              <circle cx="17" cy="18" r="2" fill="white"/>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Orix Market</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                s < step ? 'bg-brand-green text-white' :
                s === step ? 'bg-brand-green text-white ring-2 ring-brand-green/30' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 rounded ${s < step ? 'bg-brand-green' : 'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>

        <div className="card p-6">

          {step === 1 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">Yangi hisob yaratish</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ism *</label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="To'liq ismingiz" className="input-field" autoFocus/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefon *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🇺🇿</span>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+998 90 000 00 00" className="input-field pl-10"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Parol *</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="Kamida 6 belgi" className="input-field pr-10"/>
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Parolni tasdiqlang *</label>
                  <input type="password" value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    placeholder="Parolni qayta kiriting" className="input-field"/>
                </div>
                <button onClick={handleNext} className="btn-primary w-full py-2.5">
                  Davom etish →
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Hisobingiz bormi?{' '}
                <Link to="/login" className="text-brand-green font-medium hover:underline">Kirish</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <PhoneVerify
              phone={form.phone}
              onVerified={handleVerified}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Xush kelibsiz!</h2>
              <p className="text-sm text-gray-500">Hisobingiz yaratildi. Yo'naltirilmoqda...</p>
              <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mt-4"/>
            </div>
          )}
        </div>

        {step === 1 && (
          <Link to="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
            ← Bosh sahifaga qaytish
          </Link>
        )}
      </div>
    </div>
  )
}
