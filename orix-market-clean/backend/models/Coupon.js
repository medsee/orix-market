import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:        { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value:       { type: Number, required: true, min: 1 },       // % yoki so'm
  minOrder:    { type: Number, default: 0 },                    // minimal buyurtma summasi
  maxDiscount: { type: Number, default: null },                 // max chegirma (percent uchun)
  usageLimit:  { type: Number, default: null },                 // nechta marta ishlatish mumkin
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date,   default: null },
  isActive:    { type: Boolean, default: true },
  description: { type: String },
  usedBy:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

// Chegirma hisoblash
couponSchema.methods.calcDiscount = function(orderTotal) {
  if (this.type === 'percent') {
    const disc = Math.round(orderTotal * this.value / 100)
    return this.maxDiscount ? Math.min(disc, this.maxDiscount) : disc
  }
  return Math.min(this.value, orderTotal)
}

// Kupon yaroqliligini tekshirish
couponSchema.methods.validate = function(orderTotal, userId) {
  if (!this.isActive)                        return { valid: false, msg: 'Promokod faol emas' }
  if (this.expiresAt && new Date() > this.expiresAt)
                                             return { valid: false, msg: 'Promokod muddati tugagan' }
  if (this.usageLimit && this.usedCount >= this.usageLimit)
                                             return { valid: false, msg: 'Promokod limiti tugagan' }
  if (orderTotal < this.minOrder)            return { valid: false, msg: `Minimal buyurtma: ${this.minOrder.toLocaleString()} so'm` }
  if (userId && this.usedBy.includes(userId)) return { valid: false, msg: 'Bu promokodni allaqachon ishlatgansiz' }
  return { valid: true }
}

export const Coupon = mongoose.model('Coupon', couponSchema)
