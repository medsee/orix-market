import { useState } from 'react'
import { useAdminOrders } from '../hooks/useOrderTracking'
import { useSocket } from '../context/SocketContext'
import { formatPrice } from '../data/mockData'

const STATUS_LABELS = {
  pending:    { label: 'Kutilmoqda',     dot: 'bg-amber-400'  },
  processing: { label: 'Tayyorlanmoqda', dot: 'bg-blue-400'   },
  on_the_way: { label: "Yo'lda",         dot: 'bg-purple-400' },
  delivered:  { label: 'Yetkazildi',    dot: 'bg-green-400'  },
  cancelled:  { label: 'Bekor',         dot: 'bg-red-400'    },
}

function TimeAgo({ timestamp }) {
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000)
  if (diff < 60)  return <span>{diff}s oldin</span>
  if (diff < 3600) return <span>{Math.floor(diff/60)}m oldin</span>
  return <span>{Math.floor(diff/3600)}s oldin</span>
}

export default function AdminLivePanel() {
  const { connected }                         = useSocket()
  const { liveUpdates, newOrders, unread, clearUnread } = useAdminOrders()
  const [tab, setTab]                         = useState('updates') // 'updates' | 'new'

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-brand-green animate-pulse' : 'bg-gray-300'}`}/>
          <span className="text-sm font-semibold text-gray-900">Live Panel</span>
          <span className="text-xs text-gray-400">{connected ? 'Ulangan' : 'Ulanmoqda...'}</span>
        </div>
        {unread > 0 && (
          <button
            onClick={clearUnread}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
            {unread} yangi
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'updates', label: '🔄 Yangilanishlar', count: liveUpdates.length },
          { id: 'new',     label: '🆕 Yangi buyurtmalar', count: newOrders.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {tab === 'updates' && (
          liveUpdates.length === 0 ? (
            <EmptyState text="Hali yangilanish yo'q" sub="Buyurtmalar holati o'zgarganda bu yerda ko'rinadi" />
          ) : (
            <div className="divide-y divide-gray-50">
              {liveUpdates.map((u, i) => {
                const cfg = STATUS_LABELS[u.status] || { label: u.status, dot: 'bg-gray-400' }
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">
                        #{u.orderId?.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">{cfg.label}</p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">
                      <TimeAgo timestamp={u.timestamp}/>
                    </p>
                  </div>
                )
              })}
            </div>
          )
        )}

        {tab === 'new' && (
          newOrders.length === 0 ? (
            <EmptyState text="Yangi buyurtmalar yo'q" sub="Buyurtma kelganda bu yerda darhol ko'rinadi" />
          ) : (
            <div className="divide-y divide-gray-50">
              {newOrders.map((o, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-sm shrink-0">🔔</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">
                      #{o.orderId?.slice(-6).toUpperCase()} · {o.items} ta mahsulot
                    </p>
                    <p className="text-xs font-semibold text-brand-green">
                      {new Intl.NumberFormat('uz-UZ').format(o.total)} so'm
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">
                    <TimeAgo timestamp={o.timestamp}/>
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {connected
            ? 'Real-time — sahifani yangilamasdan avtomatik ko\'rinadi'
            : 'Ulanmoqda... Server ishlayaptimi?'}
        </p>
      </div>
    </div>
  )
}

function EmptyState({ text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
      <span className="text-3xl">📡</span>
      <p className="text-sm font-medium text-gray-600">{text}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}
