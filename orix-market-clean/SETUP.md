# 🚀 Orix Market — Ishga tushirish qo'llanmasi

## 1-qadam: MongoDB Atlas ulash (bepul)

### Atlas hisob yaratish
1. https://cloud.mongodb.com ga kiring
2. **"Try Free"** tugmasini bosing va hisob yarating
3. **"Build a Database"** → **M0 Free Tier** tanlang
4. Region: **AWS / Frankfurt** (yoki eng yaqin)
5. Cluster nomini kiriting: `orix-market`

### Foydalanuvchi va parol
1. **Database Access** → **"Add New Database User"**
2. Username: `orix_admin`
3. Password: kuchli parol (saqlang!)
4. Role: **Atlas admin**

### IP whitelist
1. **Network Access** → **"Add IP Address"**
2. **"Allow access from anywhere"** → `0.0.0.0/0`
3. **Confirm**

### Connection string olish
1. **Clusters** → **Connect** → **"Connect your application"**
2. Driver: **Node.js**, Version: **5.5 or later**
3. Connection string ni nusxalang:
```
mongodb+srv://orix_admin:<password>@orix-market.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 2-qadam: Backend sozlash

```bash
cd backend

# .env fayl yaratish
cp .env.example .env
```

`.env` faylni oching va to'ldiring:
```env
PORT=5000
MONGO_URI=mongodb+srv://orix_admin:SIZNING_PAROLINGIZ@orix-market.xxxxx.mongodb.net/orix_market?retryWrites=true&w=majority
JWT_SECRET=orix_market_juda_kuchli_kalit_2025
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

```bash
# Paketlarni o'rnatish
npm install

# Demo ma'lumotlarni yuklash
npm run seed
# ✅ Bu buyruq kategoriyalar, mahsulotlar va admin hisob yaratadi

# Serverni ishga tushirish
npm run dev
# 🚀 Server http://localhost:5000
```

---

## 3-qadam: Frontend sozlash

```bash
# Yangi terminal oynasida
cd frontend

npm install
npm run dev
# 🌐 http://localhost:3000
```

---

## ✅ Tekshirish

Brauzerda oching:
- **Frontend**: http://localhost:3000
- **Backend health**: http://localhost:5000/api/health
- **Mahsulotlar API**: http://localhost:5000/api/products

---

## 👤 Demo hisob

### Admin
```
Telefon: +998900000001
Parol:   admin123
```
Admin panel: http://localhost:3000/admin

---

## ❗ Tez-tez uchraydigan muammolar

| Muammo | Yechim |
|--------|--------|
| `MongoServerError: bad auth` | MONGO_URI dagi parolni tekshiring |
| `ECONNREFUSED localhost:5000` | Backend ishga tushirilganmi? |
| `Network Error` | Vite proxy sozlamasi to'g'rimi? |
| Seed ishlamadi | `.env` fayl to'g'rimi? MongoDB ulanishini tekshiring |

---

## 📁 Loyiha faylar tuzilmasi

```
orix-market/
├── frontend/
│   └── src/
│       ├── components/     Navbar, ProductCard, HeroBanner, Footer, ProductModal, ProtectedRoute
│       ├── context/        CartContext, AuthContext
│       ├── pages/          Home, Products, Cart, Checkout, Orders, Login, Register, AdminDashboard
│       └── data/           mockData.js, api.js
│
├── backend/
│   ├── config/             db.js (MongoDB ulanish)
│   ├── models/             User, Product, Category, Order
│   ├── routes/             auth, products, categories, orders
│   ├── middleware/         auth.js (JWT + adminOnly)
│   └── data/               seed.js
│
├── SETUP.md                ← Siz o'qiyotgan fayl
└── README.md
```
