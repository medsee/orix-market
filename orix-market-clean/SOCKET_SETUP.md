# ⚡ Socket.io Real-time — Qo'llanma

## Arxitektura

```
Foydalanuvchi brauzer          Backend (Socket.io)           Admin brauzer
      │                               │                            │
      │── join:order(id) ────────────▶│                            │
      │                          room: order:{id}                  │
      │                               │                            │── join:admin ──▶│
      │                               │                       room: admin             │
      │                               │                                               │
      │        [Admin holat o'zgartiradi]                                             │
      │                               │◀── PATCH /orders/:id/status ────────────────│
      │◀── order:update ──────────────│──── order:update ──────────────────────────▶│
      │   { status, timestamp }       │                                               │
```

## Eventlar

### Server → Client
| Event | Ma'lumot | Kim uchun |
|-------|----------|-----------|
| `order:update` | `{ orderId, status, timestamp, courierName }` | Foydalanuvchi + Admin |
| `order:new` | `{ orderId, items, total, timestamp }` | Faqat Admin |
| `stats:update` | `{ totalOrders, revenue }` | Faqat Admin |
| `order:location` | `{ orderId, lat, lng }` | Foydalanuvchi |

### Client → Server
| Event | Ma'lumot | Tavsif |
|-------|----------|--------|
| `join:order` | `orderId` | Buyurtma xonasiga qo'shilish |
| `join:admin` | — | Admin xonasiga (faqat admin) |
| `join:courier` | `courierId` | Kuryer xonasi |
| `order:ack` | `orderId` | Bildirish ko'rildi |

---

## Frontend — komponentlar

### OrderTracker — buyurtma kuzatish
```jsx
import OrderTracker from '../components/OrderTracker'

// Buyurtmalar sahifasida
<OrderTracker
  orderId={order._id}
  initialStatus={order.status}   // 'pending' | 'processing' | 'on_the_way' | 'delivered'
  showHistory={true}             // Holat tarixini ko'rsatish
/>
```

### AdminLivePanel — live stream
```jsx
import AdminLivePanel from '../components/AdminLivePanel'

// Admin dashboard da
<AdminLivePanel />   // Avtomatik admin xonasiga qo'shiladi
```

### LiveOrdersBadge — yangi buyurtmalar
```jsx
import LiveOrdersBadge from '../components/LiveOrdersBadge'

// Navbar yoki topbar da
<LiveOrdersBadge />   // Yangi buyurtma kelganda badge ko'rsatadi
```

### useOrderTracking — custom hook
```jsx
import { useOrderTracking } from '../hooks/useOrderTracking'

function MyComponent({ orderId }) {
  const {
    status,       // 'pending' | 'processing' | 'on_the_way' | 'delivered'
    currentStep,  // 0 | 1 | 2 | 3
    steps,        // Barcha bosqichlar massivi
    courierName,  // Kuryer ismi (on_the_way bo'lsa)
    isDelivered,  // boolean
    lastUpdate,   // ISO timestamp
  } = useOrderTracking(orderId, 'pending')

  return <div>Status: {status}</div>
}
```

---

## Backend — emit funksiyalari

```js
import { emitOrderUpdate, emitNewOrder, emitCourierLocation } from '../socket/index.js'

// Holat o'zgarganda
emitOrderUpdate(orderId, {
  status: 'on_the_way',
  courierName: 'Jasur',
})

// Yangi buyurtma (avtomatik — orders route da ulangan)
emitNewOrder(order)

// Kuryer joylashuvi (kelajak)
emitCourierLocation(orderId, { lat: 41.2995, lng: 69.2401 })
```

---

## Test qilish (development)

```bash
# 1. Holat yangilash simulatsiyasi
curl -X POST http://localhost:5000/api/socket/test-update \
  -H "Content-Type: application/json" \
  -d '{"orderId":"demo_1","status":"on_the_way","courierName":"Jasur"}'

# 2. Yangi buyurtma simulatsiyasi
curl -X POST http://localhost:5000/api/socket/test-new-order \
  -d '{"total":85000}'

# 3. To'liq flow (4 qadam, har 2 sekundda)
curl -X POST http://localhost:5000/api/socket/test-flow \
  -d '{"orderId":"demo_1"}'
```

Frontend da `/orders` sahifasini ochib, terminal da test-flow ni ishga tushiring — real vaqtda bosqichlarni ko'rasiz!

---

## .env yangilash shart emas
Socket.io uchun alohida env kerak emas — mavjud `CLIENT_URL` va `JWT_SECRET` ishlatiladi.

## Production uchun
Railway da WebSocket avtomatik qo'llab-quvvatlanadi. Vercel Edge Functions WebSocket-ni qo'llamaydi — bu sababdan backend Railway da bo'lishi muhim.
