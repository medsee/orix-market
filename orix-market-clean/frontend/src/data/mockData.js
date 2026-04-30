export const CATEGORIES = [
  { _id: 'all',       name: 'Barchasi',         icon: '🛒', slug: 'all' },
  { _id: 'vegetables', name: 'Sabzavotlar',      icon: '🥬', slug: 'vegetables' },
  { _id: 'fruits',     name: 'Mevalar',          icon: '🍎', slug: 'fruits' },
  { _id: 'meat',       name: "Go'sht",           icon: '🥩', slug: 'meat' },
  { _id: 'dairy',      name: 'Sut mahsulotlari', icon: '🥛', slug: 'dairy' },
  { _id: 'bakery',     name: 'Non-pishiriq',     icon: '🍞', slug: 'bakery' },
  { _id: 'household',  name: 'Maishiy kimyo',    icon: '🧴', slug: 'household' },
]

export const PRODUCTS = [
  { _id: '1',  name: 'Pomidor',         unit: '1 kg',   price: 6000,   category: 'vegetables', emoji: '🍅', discount: 0,  featured: true,  inStock: true },
  { _id: '2',  name: 'Brokoli',         unit: '500 gr', price: 8500,   category: 'vegetables', emoji: '🥦', discount: 15, featured: true,  inStock: true },
  { _id: '3',  name: 'Sabzi',           unit: '1 kg',   price: 4000,   category: 'vegetables', emoji: '🥕', discount: 0,  featured: false, inStock: true },
  { _id: '4',  name: 'Bodring',         unit: '1 kg',   price: 5000,   category: 'vegetables', emoji: '🥒', discount: 0,  featured: false, inStock: true },
  { _id: '5',  name: "Kartoshka",       unit: '2 kg',   price: 7000,   category: 'vegetables', emoji: '🥔', discount: 0,  featured: false, inStock: true },
  { _id: '6',  name: 'Olma (Fuji)',     unit: '1 kg',   price: 12000,  category: 'fruits',     emoji: '🍎', discount: 0,  featured: true,  inStock: true },
  { _id: '7',  name: 'Banan',           unit: '1 kg',   price: 9000,   category: 'fruits',     emoji: '🍌', discount: 10, featured: true,  inStock: true },
  { _id: '8',  name: 'Uzum',            unit: '1 kg',   price: 15000,  category: 'fruits',     emoji: '🍇', discount: 0,  featured: false, inStock: true },
  { _id: '9',  name: 'Mol go\'shti',    unit: '500 gr', price: 42500,  category: 'meat',       emoji: '🥩', discount: 0,  featured: true,  inStock: true },
  { _id: '10', name: 'Tovuq',           unit: '1 kg',   price: 28000,  category: 'meat',       emoji: '🍗', discount: 5,  featured: true,  inStock: true },
  { _id: '11', name: 'Sut (Lactel)',    unit: '1 litr', price: 12000,  category: 'dairy',      emoji: '🥛', discount: 10, featured: true,  inStock: true },
  { _id: '12', name: 'Tuxum',           unit: '10 dona',price: 22000,  category: 'dairy',      emoji: '🥚', discount: 0,  featured: true,  inStock: true },
  { _id: '13', name: 'Qatiq',           unit: '500 gr', price: 8000,   category: 'dairy',      emoji: '🫙', discount: 0,  featured: false, inStock: true },
  { _id: '14', name: 'Non (Oq)',        unit: '1 dona', price: 4000,   category: 'bakery',     emoji: '🍞', discount: 0,  featured: true,  inStock: true },
  { _id: '15', name: 'Lavash',          unit: '5 dona', price: 6500,   category: 'bakery',     emoji: '🫓', discount: 0,  featured: false, inStock: true },
  { _id: '16', name: 'Idish yuvish vositasi', unit: '500 ml', price: 14000, category: 'household', emoji: '🧴', discount: 0, featured: false, inStock: true },
]

export const formatPrice = (price) =>
  new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m'

export const discountedPrice = (price, discount) =>
  discount > 0 ? Math.round(price * (1 - discount / 100)) : price
