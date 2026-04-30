import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Category, Product, User } from '../models/index.js'
import { Coupon } from '../models/Coupon.js'

dotenv.config()

const categories = [
  { name: 'Sabzavotlar',       slug: 'vegetables', icon: '🥬', order: 1 },
  { name: 'Mevalar',           slug: 'fruits',     icon: '🍎', order: 2 },
  { name: "Go'sht",            slug: 'meat',       icon: '🥩', order: 3 },
  { name: 'Sut mahsulotlari',  slug: 'dairy',      icon: '🥛', order: 4 },
  { name: 'Non-pishiriq',      slug: 'bakery',     icon: '🍞', order: 5 },
  { name: 'Maishiy kimyo',     slug: 'household',  icon: '🧴', order: 6 },
]

const products = [
  { name: 'Pomidor',        emoji: '🍅', unit: '1 kg',    price: 6000,  category: 'vegetables', featured: true,  inStock: true },
  { name: 'Brokoli',        emoji: '🥦', unit: '500 gr',  price: 8500,  category: 'vegetables', featured: true,  inStock: true,  discount: 15 },
  { name: 'Sabzi',          emoji: '🥕', unit: '1 kg',    price: 4000,  category: 'vegetables', featured: false, inStock: true },
  { name: 'Bodring',        emoji: '🥒', unit: '1 kg',    price: 5000,  category: 'vegetables', featured: false, inStock: true },
  { name: "Kartoshka",      emoji: '🥔', unit: '2 kg',    price: 7000,  category: 'vegetables', featured: false, inStock: true },
  { name: 'Olma (Fuji)',    emoji: '🍎', unit: '1 kg',    price: 12000, category: 'fruits',     featured: true,  inStock: true },
  { name: 'Banan',          emoji: '🍌', unit: '1 kg',    price: 9000,  category: 'fruits',     featured: true,  inStock: true,  discount: 10 },
  { name: 'Uzum',           emoji: '🍇', unit: '1 kg',    price: 15000, category: 'fruits',     featured: false, inStock: true },
  { name: "Mol go'shti",    emoji: '🥩', unit: '500 gr',  price: 42500, category: 'meat',       featured: true,  inStock: true },
  { name: 'Tovuq',          emoji: '🍗', unit: '1 kg',    price: 28000, category: 'meat',       featured: true,  inStock: true,  discount: 5 },
  { name: 'Sut (Lactel)',   emoji: '🥛', unit: '1 litr',  price: 12000, category: 'dairy',      featured: true,  inStock: true,  discount: 10 },
  { name: 'Tuxum',          emoji: '🥚', unit: '10 dona', price: 22000, category: 'dairy',      featured: true,  inStock: true },
  { name: 'Non (Oq)',       emoji: '🍞', unit: '1 dona',  price: 4000,  category: 'bakery',     featured: true,  inStock: true },
  { name: 'Lavash',         emoji: '🫓', unit: '5 dona',  price: 6500,  category: 'bakery',     featured: false, inStock: true },
]

const coupons = [
  { code: 'YANGI10',  type: 'percent', value: 10,    minOrder: 50000,  description: 'Yangi foydalanuvchilar uchun 10%' },
  { code: 'SUMMER20', type: 'percent', value: 20,    minOrder: 100000, maxDiscount: 50000, usageLimit: 50, description: 'Yozgi aksiya 20%' },
  { code: 'FLAT15K',  type: 'fixed',   value: 15000, minOrder: 80000,  description: '15,000 so'm chegirma' },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB ulandi')

    await Category.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()
    await Coupon.deleteMany()

    await Category.insertMany(categories)
    await Product.insertMany(products)
    await Coupon.insertMany(coupons)

    await User.create({
      name: 'Admin',
      phone: '+998900000001',
      password: 'admin123',
      role: 'admin',
    })

    console.log('🌱 Ma\'lumotlar muvaffaqiyatli yuklandi!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed xatosi:', err.message)
    process.exit(1)
  }
}

seed()
