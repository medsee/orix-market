import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

import productRoutes  from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import orderRoutes    from './routes/orders.js'
import authRoutes     from './routes/auth.js'
import paymentRoutes  from './routes/payment.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

app.use('/api/products',   productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/auth',       authRoutes)
app.use('/api/payment',    paymentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Orix Market API 🟢', time: new Date() })
})

app.use((req, res) => res.status(404).json({ success: false, message: 'Route topilmadi' }))
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server xatosi' })
})

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}`))
})
