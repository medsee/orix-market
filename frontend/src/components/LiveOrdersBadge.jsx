import { useEffect } from 'react'
import { useAdminOrders } from '../hooks/useOrderTracking'
import toast from 'react-hot-toast'

export default function LiveOrdersBadge() {
  const { unread, newOrders, clearUnread } = useAdminOrders()

  // Yangi buyurtma kelganda toast ko'rsatish
  useEffect(() => {
    if (newOrders.length === 0) return
    const latest = newOrders[0]
    toast.custom((t) => (
      <div className={`card px-4 py-3 flex items-center gap-3 ${t.visible ? 'animate-fade-in' : ''}`}>
        <span className="text-xl">🔔</span>
        <div>
          <p className="text-sm font-semibold text-gray-900">Yangi buyurtma!</p>
          <p className="text-xs text-gray-500">
            {latest.items} ta mahsulot · {new Intl.NumberFormat('uz-UZ').format(latest.total)} so'm
          </p>
        </div>
      </div>
    ), { duration: 4000, position: 'top-right' })
  }, [newOrders.length])

  if (unread === 0) return null

  return (
    <button
      onClick={clearUnread}
      className="relative flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/>
      {unread} yangi buyurtma
    </button>
  )
}
