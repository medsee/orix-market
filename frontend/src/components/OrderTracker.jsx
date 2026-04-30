import { useOrderTracking } from '../hooks/useOrderTracking'
import { useSocket } from '../context/SocketContext'

function StatusStep({ step, index, currentStep, isLast }) {
  const isDone   = index < currentStep
  const isActive = index === currentStep

  return (
    <div className="flex gap-3">
      {/* Line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 transition-all duration-500 ${
          isDone   ? 'bg-brand-green text-white' :
          isActive ? 'bg-brand-green text-white ring-4 ring-brand-green/20' :
          'bg-gray-100 text-gray-400'
        }`}>
          {isDone ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <span>{step.icon}</span>
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-8 mt-1 transition-all duration-700 ${
            isDone ? 'bg-brand-green' : 'bg-gray-200'
          }`}/>
        )}
      </div>

      {/* Content */}
      <div className="pb-8 flex-1">
        <p className={`text-sm font-medium transition-colors ${
          isActive ? 'text-brand-green' : isDone ? 'text-gray-700' : 'text-gray-400'
        }`}>
          {step.label}
        </p>
        {isActive && (
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse inline-block"/>
            {step.desc}
          </p>
        )}
        {isDone && (
          <p className="text-xs text-gray-400 mt-0.5">Bajarildi ✓</p>
        )}
      </div>
    </div>
  )
}

export default function OrderTracker({ orderId, initialStatus = 'pending', showHistory = false }) {
  const { connected } = useSocket()
  const {
    status, currentStep, steps, updates,
    lastUpdate, courierName, isDelivered, isCancelled,
  } = useOrderTracking(orderId, initialStatus)

  if (isCancelled) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl">❌</div>
          <div>
            <p className="font-semibold text-sm">Buyurtma bekor qilindi</p>
            <p className="text-xs text-gray-500 mt-0.5">Savollar uchun qo'ng'iroq qiling</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900 text-sm">
          Buyurtma holati
        </h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-brand-green animate-pulse' : 'bg-gray-300'}`}/>
          <span className="text-xs text-gray-400">
            {connected ? 'Live' : 'Ulanmoqda...'}
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div>
        {steps.map((step, i) => (
          <StatusStep
            key={step.key}
            step={step}
            index={i}
            currentStep={currentStep}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>

      {/* Kuryer ma'lumoti */}
      {courierName && status === 'on_the_way' && (
        <div className="mt-2 p-3 bg-brand-light rounded-xl border border-brand-green/20 flex items-center gap-3">
          <span className="text-xl">🛵</span>
          <div>
            <p className="text-xs font-medium text-brand-dark">Kuryer yo'lda</p>
            <p className="text-xs text-gray-600">{courierName}</p>
          </div>
        </div>
      )}

      {/* Muvaffaqiyat */}
      {isDelivered && (
        <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200 text-center">
          <p className="text-sm font-semibold text-green-800">🎉 Buyurtma yetkazildi!</p>
          <p className="text-xs text-green-600 mt-0.5">Xaridingiz uchun rahmat</p>
        </div>
      )}

      {/* Oxirgi yangilanish */}
      {lastUpdate && (
        <p className="text-xs text-gray-400 mt-3 text-right">
          Yangilandi: {new Date(lastUpdate).toLocaleTimeString('uz-UZ')}
        </p>
      )}

      {/* Tarix */}
      {showHistory && updates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Holat tarixi</p>
          <div className="space-y-1.5">
            {updates.map((u, i) => (
              <div key={i} className="flex justify-between text-xs text-gray-500">
                <span>{steps.find(s => s.key === u.status)?.label || u.status}</span>
                <span>{new Date(u.timestamp).toLocaleTimeString('uz-UZ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
