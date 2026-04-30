# 🖼️ Cloudinary Rasm Yuklash — Sozlash Qo'llanmasi

## Arxitektura

```
Admin panel → ImageUpload (drag-drop) → POST /api/upload/product/:id
                                              ↓
                                        multer (memory)
                                              ↓
                                        Cloudinary CDN
                                              ↓
                                        secure_url → MongoDB saqlash
                                              ↓
                                        ProductImage → mahsulot ko'rsatish
```

---

## 1-qadam: Cloudinary hisob (bepul)

1. https://cloudinary.com/users/register/free ga kiring
2. Ro'yxatdan o'ting — **kredit karta kerak emas**
3. Dashboard da bu ma'lumotlarni toping:
   - **Cloud name**
   - **API Key**
   - **API Secret**

Bepul hisob limitleri:
- 25 GB saqlash
- 25 GB/oy trafik
- Orix Market uchun yetarli!

---

## 2-qadam: .env ga qo'shing

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## 3-qadam: Backend paketlarni o'rnatish

```bash
cd backend
npm install cloudinary multer
```

---

## 4-qadam: Tekshirish

```bash
# Serverni ishga tushiring
npm run dev

# API test (HTTPie yoki Postman)
curl -X POST http://localhost:5000/api/upload/general \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/test.jpg"

# Javob:
# {
#   "success": true,
#   "data": {
#     "url": "https://res.cloudinary.com/your_cloud/...",
#     "publicId": "orix-market/general/abc123",
#     "width": 800,
#     "height": 800
#   }
# }
```

---

## API Endpoints

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/upload/product/:id` | Mahsulotga rasm biriktirish |
| POST | `/api/upload/general` | Umumiy rasm yuklash |
| POST | `/api/upload/bulk` | Ko'p rasm (max 10) |
| DELETE | `/api/upload/:publicId` | Rasmni o'chirish |

---

## Frontend komponentlar

### ImageUpload — drag-drop yuklash
```jsx
import ImageUpload from '../components/ImageUpload'

<ImageUpload
  productId="product_id_here"    // ixtiyoriy
  currentImage={product.image}   // mavjud rasm URL
  onUploadSuccess={({ url, publicId }) => {
    // rasm yuklangandan keyin chaqiriladi
    console.log('Yuklandi:', url)
  }}
/>
```

### ProductImage — aqlli ko'rsatish
```jsx
import ProductImage from '../components/ProductImage'

// Rasm bo'lsa — rasm, bo'lmasa — emoji ko'rsatadi
<ProductImage
  src={product.image}      // Cloudinary URL yoki bo'sh
  emoji={product.emoji}    // fallback emoji
  alt={product.name}
  className="h-32 w-full"
/>
```

---

## Cloudinary transformatsiyalar

Backend da avtomatik qo'llanadi:
- **Crop**: 800×800px, markazdan kesish
- **Format**: avtomatik (WebP zamonaviy brauzerlarda)
- **Quality**: avtomatik siqish (hajmni kamaytiradi)

Maxsus o'lcham kerak bo'lsa `config/cloudinary.js` dagi `transformation` ni o'zgartiring:
```js
{ width: 400, height: 300, crop: 'fill' },   // kichik thumbnail
{ width: 1200, height: 600, crop: 'fill' },  // banner
```

---

## Fayl cheklovlari

| Parametr | Qiymat |
|----------|--------|
| Max fayl hajmi | 5 MB |
| Qabul qilinadigan formatlar | JPEG, PNG, WebP |
| Max bulk yuklash | 10 ta bir vaqtda |
| Saqlash papkasi | `orix-market/products/` |
