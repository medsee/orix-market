import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ── User ──────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  address:  { type: String },
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password)
}

// ── Category ──────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name:  { type: String, required: true },
  slug:  { type: String, required: true, unique: true },
  icon:  { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true })

// ── Product ───────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  slug:     { type: String, unique: true },
  emoji:    { type: String, default: '📦' },
  price:    { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  unit:     { type: String, default: '1 dona' },
  category: { type: String, required: true },
  inStock:  { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  description:   { type: String },
  image:         { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
}, { timestamps: true })

productSchema.virtual('finalPrice').get(function() {
  return this.discount > 0
    ? Math.round(this.price * (1 - this.discount / 100))
    : this.price
})

// ── Order ─────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  emoji:    String,
  price:    Number,
  quantity: { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items:       [orderItemSchema],
  totalPrice:  { type: Number, required: true },
  deliveryFee: { type: Number, default: 15000 },
  address:     { type: String, required: true },
  phone:       { type: String, required: true },
  status:      {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'payme', 'click', 'uzum'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'cancelled', 'refunded'],
    default: 'unpaid',
  },
  // To'lov provayderidan kelgan ma'lumotlar
  payment: {
    provider:      { type: String },      // 'payme' | 'click'
    transactionId: { type: String },      // Payme transaction ID
    clickTransId:  { type: String },      // Click trans ID
    prepareId:     { type: Number },      // Click prepare ID
    confirmId:     { type: Number },      // Click confirm ID
    state:         { type: Number },      // 1=yaratildi, 2=bajarildi, -1=bekor
    createTime:    { type: Number },      // ms timestamp
    performTime:   { type: Number },
    cancelTime:    { type: Number },
    reason:        { type: Number },      // Payme bekor sababi
  },
  note: String,
}, { timestamps: true })

export const User     = mongoose.model('User',     userSchema)
export const Category = mongoose.model('Category', categorySchema)
export const Product  = mongoose.model('Product',  productSchema)
export const Order    = mongoose.model('Order',    orderSchema)
