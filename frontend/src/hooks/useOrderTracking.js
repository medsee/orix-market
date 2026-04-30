import { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../context/SocketContext'

const STATUS_STEPS = [
  { key: 'pending',    label: 'Qabul qilindi',  icon: '📋', desc: 'Buyurtmangiz qabul qilindi' },
  { key: 'processing', label: 'Tayyorlanmoqda', icon: '👨‍🍳', desc: 'Mahsulotlar yig\'ilmoqda' },
  { key: 'on_the_way', label: "Yo'lda",         icon: '🛵', desc: 'Kuryer sizga kelmoqda' },
  { key: 'delivered',  label: 'Yetkazildi',     icon: '✅', desc: "Buyurtma qo'lingizda!" },
]

export function useOrderTracking(orderId, initialStatus = 'pending') {
  const { joinOrderRoom, on } = useSocket()
  const [status,      setStatus]      = useState(initialStatus)
  const [updates,     setUpdates]     = useState([])
  const [lastUpdate,  setLastUpdate]  = useState(null)
  const [courierName, setCourierName] = useState(null)

  // Buyurtma xonasiga qo'shilish
  useEffect(() => {
    if (!orderId) return
    joinOrderRoom(orderId)
  }, [orderId])

  // order:update eventini tinglash
  useEffect(() => {
    if (!orderId) return
    const unsub = on('order:update', (data) => {
      if (data.orderId !== orderId) return
      setStatus(data.status)
      setLastUpdate(data.timestamp)
      if (data.courierName) setCourierName(data.courierName)
      setUpdates(prev => [
        { status: data.status, timestamp: data.timestamp, courierName: data.courierName },
        ...prev,
      ])
    })
    return unsub
  }, [orderId, on])

  const currentStep = STATUS_STEPS.findIndex(s => s.key === status)
  const stepInfo    = STATUS_STEPS[currentStep] || STATUS_STEPS[0]

  return {
    status,
    currentStep,
    stepInfo,
    steps: STATUS_STEPS,
    updates,
    lastUpdate,
    courierName,
    isDelivered: status === 'delivered',
    isCancelled: status === 'cancelled',
  }
}

// Admin uchun — barcha buyurtmalarni kuzatish
export function useAdminOrders() {
  const { joinAdminRoom, on } = useSocket()
  const [liveUpdates, setLiveUpdates] = useState([])
  const [newOrders,   setNewOrders]   = useState([])
  const [unread,      setUnread]      = useState(0)

  useEffect(() => {
    joinAdminRoom()
  }, [])

  useEffect(() => {
    const unsubUpdate = on('order:update', (data) => {
      setLiveUpdates(prev => [data, ...prev.slice(0, 49)]) // max 50 ta
    })
    const unsubNew = on('order:new', (data) => {
      setNewOrders(prev => [data, ...prev])
      setUnread(n => n + 1)
    })
    return () => { unsubUpdate(); unsubNew() }
  }, [on])

  const clearUnread = useCallback(() => setUnread(0), [])

  return { liveUpdates, newOrders, unread, clearUnread }
}
