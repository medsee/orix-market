import { Link } from 'react-router-dom'

const STATUS = {
  unpaid:    { label: "To'lanmagan",   cls: 'bg-gray-100  text-gray-600',   icon: '⭕' },
  pending:   { label: "Kutilmoqda",    cls: 'bg-amber-50  text-amber-700',  icon: '⏳' },
  paid:      { label: "To'langan",     cls: 'bg-green-50  text-green-700',  icon: '✅' },
  cancelled: { label: "Bekor qilindi", cls: 'bg-red-50    text-red-700',    icon: '❌' },
  refunded:  { label: "Qaytarildi",   cls: 'bg-purple-50 text-purple-700', icon: '↩️' },
}

export default function PaymentStatus({ status = 'unpaid', orderId, showPayBtn = false }) {
  const cfg = STATUS[status] || STATUS.unpaid

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
        <span>{cfg.icon}</span>
        {cfg.label}
      </span>

      {showPayBtn && status === 'unpaid' && orderId && (
        <Link
          to={`/payment/${orderId}`}
          className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-brand-green text-white hover:bg-brand-dark transition-colors"
        >
          💳 To'lash
        </Link>
      )}
    </div>
  )
}
