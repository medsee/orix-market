/**
 * Socket.io Server
 * 
 * Xonalar (rooms):
 *   order:{orderId}   — foydalanuvchi o'z buyurtmasini kuzatadi
 *   admin             — admin barcha buyurtmalarni live ko'radi
 *   courier:{id}      — kuryer o'z buyurtmalarini ko'radi
 *
 * Eventlar:
 *   server → client:
 *     order:update      — buyurtma holati o'zgardi
 *     order:new         — yangi buyurtma keldi (admin)
 *     order:location    — kuryer joylashuvi (kelajak)
 *     stats:update      — admin statistika yangilandi
 *
 *   client → server:
 *     join:order        — buyurtma xonasiga qo'shilish
 *     join:admin        — admin xonasiga qo'shilish
 *     order:ack         — foydalanuvchi bildirish ko'rdi
 */

import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

let io = null

// ── Socket.io ni Express serverga ulash ──────────────────
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || 'http://localhost:3000',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    // Avval WebSocket, keyin polling
    transports: ['websocket', 'polling'],
  })

  // ── Auth middleware ─────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token
    if (!token) {
      // Guest foydalanuvchilar ham kuzatishi mumkin (orderId orqali)
      socket.user = null
      return next()
    }
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET)
      next()
    } catch {
      socket.user = null
      next() // tokenni rad etmaymiz — guest sifatida ulashadi
    }
  })

  // ── Connection handler ──────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`🔌 Socket ulandi: ${socket.id} | user: ${socket.user?.id || 'guest'}`)

    // Buyurtma xonasiga qo'shilish
    socket.on('join:order', (orderId) => {
      if (!orderId) return
      socket.join(`order:${orderId}`)
      console.log(`📦 ${socket.id} → order:${orderId}`)
      socket.emit('joined', { room: `order:${orderId}` })
    })

    // Admin xonasiga qo'shilish (faqat admin)
    socket.on('join:admin', () => {
      if (socket.user?.role !== 'admin') {
        return socket.emit('error', { message: 'Admin ruxsati kerak' })
      }
      socket.join('admin')
      console.log(`⚙️  Admin ulandi: ${socket.id}`)
      socket.emit('joined', { room: 'admin' })
    })

    // Kuryer xonasi
    socket.on('join:courier', (courierId) => {
      if (!courierId) return
      socket.join(`courier:${courierId}`)
      socket.emit('joined', { room: `courier:${courierId}` })
    })

    // Bildirish ko'rildi
    socket.on('order:ack', (orderId) => {
      console.log(`✅ Ack: order:${orderId}`)
    })

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket uzildi: ${socket.id} (${reason})`)
    })

    socket.on('error', (err) => {
      console.error('Socket xatosi:', err)
    })
  })

  console.log('✅ Socket.io ishga tushdi')
  return io
}

// ── Buyurtma holati o'zgardi — emit ──────────────────────
export const emitOrderUpdate = (orderId, data) => {
  if (!io) return
  const payload = {
    orderId,
    timestamp: new Date().toISOString(),
    ...data,
  }
  // Buyurtma xonasiga
  io.to(`order:${orderId}`).emit('order:update', payload)
  // Admin xonasiga
  io.to('admin').emit('order:update', payload)
  console.log(`📡 order:update → order:${orderId}`, data.status)
}

// ── Yangi buyurtma keldi — admin ga emit ─────────────────
export const emitNewOrder = (order) => {
  if (!io) return
  io.to('admin').emit('order:new', {
    orderId:   order._id,
    customer:  order.phone,
    total:     order.totalPrice + (order.deliveryFee || 0),
    items:     order.items?.length || 0,
    timestamp: new Date().toISOString(),
  })
  console.log('📡 order:new → admin')
}

// ── Admin statistika yangilandi ───────────────────────────
export const emitStatsUpdate = (stats) => {
  if (!io) return
  io.to('admin').emit('stats:update', stats)
}

// ── Kuryer joylashuvi ─────────────────────────────────────
export const emitCourierLocation = (orderId, location) => {
  if (!io) return
  io.to(`order:${orderId}`).emit('order:location', {
    orderId,
    lat: location.lat,
    lng: location.lng,
    timestamp: new Date().toISOString(),
  })
}

// ── Socket instance olish ─────────────────────────────────
export const getIO = () => io
