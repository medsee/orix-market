# 🛒 Orix Market — Full-Stack Platform

Uzum Market uslubidagi O'zbekiston online oziq-ovqat yetkazib berish platformasi.

## Tech Stack

| Qatlam    | Texnologiya                    |
|-----------|-------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS |
| Backend   | Node.js + Express.js          |
| Database  | MongoDB + Mongoose            |
| Auth      | JWT (JSON Web Token)          |
| State     | React Context API             |

---

## Loyiha tuzilmasi

```
orix-market/
├── frontend/           # React + Tailwind
│   └── src/
│       ├── components/ # Navbar, ProductCard, HeroBanner ...
│       ├── pages/      # HomePage, ProductsPage, CartPage, OrdersPage
│       ├── context/    # CartContext (global savat holati)
│       └── data/       # mockData, api.js
│
├── backend/            # Node.js + Express
│   ├── models/         # User, Product, Category, Order (Mongoose)
│   ├── routes/         # /api/products, /api/orders, /api/auth ...
│   ├── middleware/     # JWT auth, adminOnly
│   └── data/           # seed.js (demo ma'lumotlar)
│
└── README.md
```

---

## O'rnatish va ishga tushirish

### 1. Backend sozlash

```bash
cd backend
npm install

# .env fayl yaratish
cp .env.example .env
# .env ichida MONGO_URI va JWT_SECRET ni o'rnating

# Demo ma'lumotlarni yuklash
npm run seed

# Serverni ishga tushirish
npm run dev
# → http://localhost:5000
```

### 2. Frontend sozlash

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## API Endpoints

### Mahsulotlar
| Method | URL                         | Tavsif                        |
|--------|-----------------------------|-------------------------------|
| GET    | /api/products               | Barcha mahsulotlar            |
| GET    | /api/products?category=meat | Kategoriya bo'yicha filter    |
| GET    | /api/products?search=non    | Qidiruv                       |
| GET    | /api/products/featured      | Featured mahsulotlar          |
| GET    | /api/products/:id           | Bitta mahsulot                |
| POST   | /api/products               | Yangi mahsulot (admin)        |
| PUT    | /api/products/:id           | Tahrirlash (admin)            |
| DELETE | /api/products/:id           | O'chirish (admin)             |

### Buyurtmalar
| Method | URL                      | Tavsif                      |
|--------|--------------------------|-----------------------------|
| POST   | /api/orders              | Buyurtma yaratish           |
| GET    | /api/orders/my           | Mening buyurtmalarim        |
| GET    | /api/orders              | Barcha buyurtmalar (admin)  |
| PATCH  | /api/orders/:id/status   | Status yangilash (admin)    |

### Auth
| Method | URL               | Tavsif              |
|--------|-------------------|---------------------|
| POST   | /api/auth/register | Ro'yxatdan o'tish  |
| POST   | /api/auth/login    | Kirish              |
| GET    | /api/auth/me       | Profil (token bilan)|

---

## Demo admin hisob

```
Telefon:  +998900000001
Parol:    admin123
```

---

## Keyingi qadamlar

- [ ] Admin panel (mahsulot CRUD, buyurtmalar boshqaruvi)
- [ ] To'lov integratsiyasi (Payme, Click)
- [ ] Real-time buyurtma holati (Socket.io)
- [ ] Mahsulot rasmlari (Cloudinary)
- [ ] SMS bildirish (Eskiz / Playmobile)
- [ ] Deploy (Vercel + Railway yoki VPS)
