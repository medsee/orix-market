# 🚀 Deploy — To'liq Qo'llanma

## Loyiha tuzilmasi

```
orix-market/
├── frontend/          → Vercel
│   └── vercel.json    ← Deploy config
├── backend/           → Railway
│   └── railway.toml   ← Deploy config
└── .github/
    └── workflows/
        └── deploy.yml ← CI/CD (har push da avtomatik)
```

---

## 1-qadam: GitHub ga push

```bash
cd orix-market
git init
git add .
git commit -m "feat: Orix Market v1.0 — full stack"
git branch -M main

# github.com/new da repo yarating, keyin:
git remote add origin https://github.com/SIZNING/orix-market.git
git push -u origin main
```

---

## 2-qadam: Vercel

1. **vercel.com** → New Project → GitHub repo import
2. **Root Directory**: `frontend`
3. **Framework**: Vite (avtomatik aniqlanadi)
4. **Environment Variables**:
   ```
   VITE_API_URL = https://orix-market-backend.up.railway.app
   ```
5. Deploy tugmasini bosing

**Vercel Secrets** (CI/CD uchun):
- `Settings → Tokens` → New Token → nusxa oling

---

## 3-qadam: Railway

1. **railway.app** → New Project → Deploy from GitHub
2. **Root Directory**: `backend`
3. **Environment Variables** — barchasini kiriting:

```env
PORT                   = 5000
NODE_ENV               = production
MONGO_URI              = mongodb+srv://...
JWT_SECRET             = [kamida 32 belgi]
JWT_EXPIRE             = 30d
CLIENT_URL             = https://orix-market.vercel.app

PAYME_MERCHANT_ID      = ...
PAYME_SECRET_KEY       = ...
PAYME_TEST_SECRET_KEY  = ...
PAYME_TEST_MODE        = false

CLICK_SERVICE_ID       = ...
CLICK_MERCHANT_ID      = ...
CLICK_SECRET_KEY       = ...

CLOUDINARY_CLOUD_NAME  = ...
CLOUDINARY_API_KEY     = ...
CLOUDINARY_API_SECRET  = ...

ESKIZ_EMAIL            = ...
ESKIZ_PASSWORD         = ...
ESKIZ_FROM             = 4546
SMS_ENABLED            = true
```

**Railway Token** (CI/CD uchun):
- `Account Settings → Tokens` → New Token

---

## 4-qadam: GitHub Secrets (CI/CD uchun)

GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret nomi         | Qayerdan olish                    |
|---------------------|-----------------------------------|
| `VERCEL_TOKEN`      | vercel.com → Settings → Tokens    |
| `VERCEL_ORG_ID`     | vercel.com → Settings → General   |
| `VERCEL_PROJECT_ID` | Vercel project → Settings         |
| `RAILWAY_TOKEN`     | railway.app → Account → Tokens    |
| `VITE_API_URL`      | Railway backend URL               |

---

## 5-qadam: Test

```bash
# Backend health:
curl https://orix-market-backend.up.railway.app/api/health

# Frontend:
open https://orix-market.vercel.app
```

---

## Avtomatik deploy jarayoni

```
git push origin main
       ↓
GitHub Actions ishga tushadi
       ↓
┌──────────────────────┬──────────────────────┐
│  test-backend        │  build-frontend       │
│  (npm ci + check)    │  (npm run build)      │
└──────────┬───────────┴──────────┬────────────┘
           ↓                      ↓
    deploy-backend          deploy-frontend
    (Railway CLI)           (Vercel CLI)
           ↓                      ↓
   Railway yangilandi       Vercel yangilandi
```

**Jami vaqt**: ~3-5 daqiqa

---

## Demo promokodlar (seed dan)

| Kod        | Tur      | Chegirma | Min buyurtma |
|------------|----------|----------|--------------|
| `YANGI10`  | Foiz     | 10%      | 50,000 so'm  |
| `SUMMER20` | Foiz     | 20%      | 100,000 so'm |
| `FLAT15K`  | Summa    | 15,000   | 80,000 so'm  |

---

## Muhim eslatmalar

1. **`.env` faylni hech qachon GitHub ga push qilmang** — `.gitignore` da bor
2. **JWT_SECRET** kamida 32 belgili bo'lishi kerak
3. **CORS** — `CLIENT_URL` Vercel domeniga to'g'ri ko'rsating
4. **Socket.io** — Railway WebSocket-ni avtomatik qo'llab-quvvatlaydi ✅
5. **Payme callback**: `https://orix-market-backend.up.railway.app/api/payment/payme`
6. **Click callback**: `https://orix-market-backend.up.railway.app/api/payment/click/prepare`
