import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // MongoDB Atlas uchun zarur emas — mongoose 6+ da default qiymatlar to'g'ri
    })

    console.log(`✅ MongoDB ulandi: ${conn.connection.host}`)

    // Connection events
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB xatosi:', err)
    })
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB uzildi — qayta ulanishga harakat qilinmoqda...')
    })

  } catch (err) {
    console.error('❌ MongoDB ulanmadi:', err.message)
    console.error('\n📖 Tekshiring:')
    console.error('  1. .env faylida MONGO_URI to\'g\'ri yozilganmi?')
    console.error('  2. MongoDB Atlas da IP whitelist (0.0.0.0/0) qo\'shilganmi?')
    console.error('  3. Username va password to\'g\'rimi?\n')
    process.exit(1)
  }
}

export default connectDB
