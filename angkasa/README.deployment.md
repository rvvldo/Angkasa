# Panduan Deploy ke Vercel

## Persiapan Sebelum Deploy

### 1. Install Vercel CLI (Opsional)
```bash
npm install -g vercel
```

### 2. Setup Environment Variables di Vercel

Setelah project di-import ke Vercel, tambahkan environment variables berikut di dashboard Vercel:

**Settings → Environment Variables**

```
VITE_GEMINI_API_KEY=AIzaSyBwsyDAd23KNpzrn7Dbsg67DjwUs42DrDQ

VITE_FIREBASE_API_KEY=AIzaSyCW-Bvts7fdQovoXdIIXsMnDgU8sTURN6s
VITE_FIREBASE_AUTH_DOMAIN=lascode-2fc55.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://lascode-2fc55-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=lascode-2fc55
VITE_FIREBASE_STORAGE_BUCKET=lascode-2fc55.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=33461351636
VITE_FIREBASE_APP_ID=1:33461351636:web:306acd0c5a9cf042fdb741
VITE_FIREBASE_MEASUREMENT_ID=G-YRGG71NLLN
```

## Cara Deploy

### Opsi 1: Deploy via Vercel Dashboard (Recommended)

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub/GitLab/Bitbucket
3. Klik "Add New Project"
4. Import repository ini
5. Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`
6. Tambahkan environment variables (lihat di atas)
7. Klik "Deploy"

### Opsi 2: Deploy via CLI

```bash
# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

## Konfigurasi Firebase

Pastikan domain Vercel Anda ditambahkan ke Firebase Console:

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project "lascode-2fc55"
3. Pergi ke **Authentication → Settings → Authorized domains**
4. Tambahkan domain Vercel Anda (contoh: `your-app.vercel.app`)

## Testing Lokal

Sebelum deploy, test build production secara lokal:

```bash
cd angkasa
npm install
npm run build
npm run preview
```

## Troubleshooting

### Build Error
- Pastikan semua dependencies terinstall
- Cek apakah ada TypeScript errors: `npm run lint`

### Environment Variables Tidak Terbaca
- Pastikan semua env vars diawali dengan `VITE_`
- Redeploy setelah menambahkan env vars

### Firebase Connection Error
- Verifikasi domain sudah ditambahkan di Firebase Console
- Cek apakah semua Firebase env vars sudah benar

## File Penting

- `vercel.json` - Konfigurasi deployment Vercel
- `.env` - Environment variables lokal (jangan di-commit)
- `.env.example` - Template environment variables
- `.gitignore` - File yang diabaikan Git
