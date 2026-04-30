import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

// Dev: localhost:5000, Prod: VITE_API_URL dan /api olib tashlanadi
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '')
  : 'http://localhost:5000'

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('orix_token')

    socketRef.current = io(SOCKET_URL, {
      auth:       { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:    2000,
    })

    const s = socketRef.current
    s.on('connect',       () => setConnected(true))
    s.on('disconnect',    () => setConnected(false))
    s.on('connect_error', (err) => console.warn('Socket:', err.message))

    return () => s.disconnect()
  }, [])

  const joinOrderRoom   = (id) => socketRef.current?.emit('join:order', id)
  const joinAdminRoom   = ()   => socketRef.current?.emit('join:admin')
  const joinCourierRoom = (id) => socketRef.current?.emit('join:courier', id)
  const on    = (ev, cb) => { socketRef.current?.on(ev, cb); return () => socketRef.current?.off(ev, cb) }
  const off   = (ev, cb) => socketRef.current?.off(ev, cb)
  const emit  = (ev, d)  => socketRef.current?.emit(ev, d)

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinOrderRoom, joinAdminRoom, joinCourierRoom, on, off, emit }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be inside SocketProvider')
  return ctx
}
