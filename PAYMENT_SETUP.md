# 💳 To'lov integratsiyasi — Payme & Click

## Arxitektura

```
Foydalanuvchi → Checkout → To'lov URL → Payme/Click sayt → Callback → Backend → Buyurtma yangilanadi
```

```
frontend/
└── pages/
    └── PaymentPage.jsx       ← To'lov usuli tanlash + redirect
└── components/
    └── PaymentStatus.jsx     ← Har qanday sahifada ishlatiladigan badge

backend/
├── services/
│   ├── payme.service.js      ← JSONRPC 2.0: 6 ta method
│   └── click.service.js      ← Prepare + Complete
└── routes/
    ├── payme.js              ← POST /api/payment/payme
    ├── click.js              ← POST /api/payment/click/*
    └── payment.js            ← Agregator + /status endpoint
```

---

## Payme sozlash

### 1. Merchant hisob olish
1. https://merchant.paycom.uz ga kiring
2. "Yangi kassa" yarating
3. **Merchant ID** va **Secret Key** oling

### 2. Callback URL ni sozlash
Payme merchant kabinetida:
```
Test callback:  https://your-backend.com/api/payment/payme
Prod callback:  https://your-backend.com/api/payment/payme
```

### 3. .env ga qo'shing
```env
PAYME_MERCHANT_ID=5e730e8e0b852a417aa49ceb
PAYME_SECRET_KEY=your_production_secret
PAYME_TEST_SECRET_KEY=your_test_secret
PAYME_TEST_MODE=true
```

### 4. Test kartalar
```
Karta raqami: 8600 0000 0000 0000
Amal muddati: 03/99
SMS kod:      666666
```

### Payme JSONRPC metodlari
| Method | Tavsif |
|--------|--------|
| `CheckPerformTransaction` | To'lov qilinishi mumkinmi? |
| `CreateTransaction` | Tranzaksiya yaratish |
| `PerformTransaction` | To'lovni tasdiqlash |
| `CancelTransaction` | Bekor qilish |
| `CheckTransaction` | Holat tekshirish |
| `GetStatement` | Hisobot |

---

## Click sozlash

### 1. Merchant hisob
1. https://my.click.uz → Hamkor bo'lish
2. **Service ID** va **Merchant ID** oling
3. **Secret Key** ni saqlang

### 2. URL sozlash
Click kabinetida:
```
Prepare URL:  https://your-backend.com/api/payment/click/prepare
Complete URL: https://your-backend.com/api/payment/click/complete
Return URL:   https://your-frontend.com/orders/{orderId}?payment=success
```

### 3. .env ga qo'shing
```env
CLICK_SERVICE_ID=12345
CLICK_MERCHANT_ID=67890
CLICK_SECRET_KEY=your_click_secret_key
```

### 4. Test ma'lumotlar
```
Karta: 5614 6823 0000 0001
Muddat: 03/99
CVV: 000
OTP: 11111
```

---

## To'lov jarayoni diagrammasi

### Payme
```
1. Foydalanuvchi "Payme orqali to'lash" bosadi
2. POST /api/payment/payme/init → checkout URL qaytadi
3. window.location.href = checkoutUrl  (Payme saytiga o'tadi)
4. Foydalanuvchi karta ma'lumotlarini kiritadi
5. Payme → POST /api/payment/payme (CheckPerformTransaction)
6. Payme → POST /api/payment/payme (CreateTransaction)
7. Payme → POST /api/payment/payme (PerformTransaction)
8. Order.paymentStatus = 'paid', Order.status = 'processing'
9. Foydalanuvchi return_url ga qaytadi
```

### Click
```
1. Foydalanuvchi "Click orqali to'lash" bosadi
2. POST /api/payment/click/init → checkout URL qaytadi
3. window.location.href = checkoutUrl
4. Click → POST /api/payment/click/prepare (Prepare)
5. Foydalanuvchi tasdiqlaydi
6. Click → POST /api/payment/click/complete (Complete)
7. Order.paymentStatus = 'paid'
8. Foydalanuvchi return_url ga qaytadi
```

---

## Frontend — To'lov sahifasi yo'li

```
/checkout → buyurtma yaratiladi → /payment/:orderId → to'lov tizimiga redirect
```

### PaymentStatus komponentidan foydalanish
```jsx
import PaymentStatus from '../components/PaymentStatus'

// Buyurtma kartasida
<PaymentStatus
  status={order.paymentStatus}   // 'unpaid' | 'pending' | 'paid' | 'cancelled'
  orderId={order._id}
  showPayBtn={true}               // "To'lash" tugmasini ko'rsatsin
/>
```

---

## Muhim eslatmalar

1. **Summani tiyin/so'm farqi**:
   - Payme: tiyin (so'm × 100) → `amount = price * 100`
   - Click: so'm (tiyin emas) → `amount = price`

2. **Imzo tekshirish**: Click uchun MD5 imzo, Payme uchun Basic Auth

3. **Idempotentlik**: Bir tranzaksiya bir marta bajariladi — `transactionId` unique bo'lishi shart

4. **Test rejim**: `PAYME_TEST_MODE=true` bo'lsa test kabineti ishlatiladi
