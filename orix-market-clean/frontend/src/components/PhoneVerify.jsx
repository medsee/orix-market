import { useState, useEffect } from 'react'
import OtpInput from './OtpInput'
import { smsAPI } from '../data/api'
import toast from 'react-hot-toast'

const RESEND_COOLDOWN = 60 // soniya

export default function PhoneVerify({ phone, onVerified, onBack }) {
  const [code,       setCode]       = useState('')
  const [loading,    setLoading]    = useState(false)
  const [sending,    setSending]    = useState(false)
  const [sent,       setSent]       = useState(false)
  const [countdown,  setCountdown]  = useState(0)
  const [devCode,    setDevCode]    = useState(null) // dev rejimda ko'rsatiladi

  // SMS yuborish
  const sendCode = async () => {
    if (!phone) return
    setSending(true)
    try {
      const res = await smsAPI.sendOTP(phone)
      setSent(true)
      setCountdown(RESEND_COOLDOWN)
      toast.success(`SMS ${phone} ga yuborildi`)

      // Dev muhitida kodni ko'rsatamiz
      if (res.data._devCode) {
        setDevCode(res.data._devCode)
        toast(`Dev kod: ${res.data._devCode}`, { icon: '🔧', duration: 10000 })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'SMS yuborishda xato'
      const cd  = err.response?.data?.cooldown
      if (cd) {
        setCountdown(Math.ceil(cd / 1000))
        toast.error(msg)
      } else {
        toast.error(msg)
      }
    } finally {
      setSending(false)
    }
  }

  // Birinchi yuklashda SMS jo'natamiz
  useEffect(() => { sendCode() }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(p => p <= 1 ? 0 : p - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  // Kodni tekshirish
  const handleVerify = async () => {
    if (code.length < 6) return toast.error("6 xonali kodni to'liq kiriting")
    setLoading(true)
    try {
      await smsAPI.verifyOTP(phone, code)
      toast.success('Telefon raqam tasdiqlandi! ✅')
      onVerified?.()
    } catch (err) {
      const msg = err.response?.data?.message || "Noto'g'ri kod"
      toast.error(msg)
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  // Kod 6 ta bo'lganda avtomatik tekshirish
  useEffect(() => {
    if (code.length === 6) handleVerify()
  }, [code])

  return (
    <div className="text-center">
      {/* Header */}
      <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">📱</span>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">SMS kodni kiriting</h2>
      <p className="text-sm text-gray-500 mb-6">
        <span className="font-medium text-gray-700">{phone}</span> raqamiga{' '}
        6 xonali kod yuborildi
      </p>

      {/* Dev hint */}
      {devCode && (
        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          🔧 Dev rejim — Kod: <strong className="font-mono text-base">{devCode}</strong>
        </div>
      )}

      {/* OTP input */}
      <div className="mb-6">
        <OtpInput
          length={6}
          value={code}
          onChange={setCode}
          disabled={loading}
        />
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={loading || code.length < 6}
        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mb-4"
      >
        {loading
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Tekshirilmoqda...</span></>
          : '✅ Tasdiqlash'
        }
      </button>

      {/* Resend */}
      <div className="text-sm text-gray-500">
        {countdown > 0 ? (
          <span>Qayta yuborish: <strong className="text-brand-green tabular-nums">{countdown}s</strong></span>
        ) : (
          <button
            onClick={sendCode}
            disabled={sending}
            className="text-brand-green font-medium hover:underline disabled:opacity-50"
          >
            {sending ? 'Yuborilmoqda...' : 'Kodni qayta yuborish'}
          </button>
        )}
      </div>

      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="block mx-auto mt-3 text-xs text-gray-400 hover:text-gray-600">
          ← Raqamni o'zgartirish
        </button>
      )}
    </div>
  )
}
