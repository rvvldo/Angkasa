# Panduan Setup Firebase untuk Vercel

## Masalah: "Gagal login dengan Google: Coba lagi"

Error ini terjadi karena domain Vercel belum ditambahkan ke Firebase Authorized Domains.

## Solusi: Tambahkan Domain Vercel ke Firebase

### Langkah 1: Buka Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project **lascode-2fc55**

### Langkah 2: Tambahkan Authorized Domains

1. Di sidebar kiri, klik **Authentication**
2. Klik tab **Settings** (di bagian atas)
3. Scroll ke bawah ke bagian **Authorized domains**
4. Klik tombol **Add domain**
5. Tambahkan domain Vercel Anda:
   - Format: `your-app-name.vercel.app`
   - Contoh: `angkasaid.vercel.app`
   - Atau domain custom jika ada

### Langkah 3: Tambahkan Domain Development (Opsional)

Jika ingin test di localhost atau preview deployment:
- `localhost` (biasanya sudah ada)
- `*.vercel.app` (untuk semua preview deployment)

### Langkah 4: Verifikasi Environment Variables di Vercel

Pastikan semua environment variables sudah ditambahkan di Vercel Dashboard:

1. Buka project di [Vercel Dashboard](https://vercel.com/dashboard)
2. Pergi ke **Settings → Environment Variables**
3. Pastikan semua variable ini ada:

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

4. Pastikan environment variables di-set untuk **Production**, **Preview**, dan **Development**

### Langkah 5: Redeploy

Setelah menambahkan domain dan environment variables:
1. Kembali ke Vercel Dashboard
2. Klik **Deployments**
3. Klik tombol **Redeploy** pada deployment terakhir
4. Atau push commit baru ke Git untuk trigger deployment baru

## Troubleshooting

### Error: "The requested action is invalid"

**Penyebab:** Domain tidak ada di Firebase Authorized Domains

**Solusi:** Ikuti Langkah 2 di atas

### Error: "auth/unauthorized-domain"

**Penyebab:** Sama dengan di atas

**Solusi:** Tambahkan domain ke Firebase Console

### Login berhasil di Desktop tapi gagal di Mobile

**Penyebab:** Kode sudah menggunakan `signInWithRedirect` untuk mobile dan `signInWithPopup` untuk desktop

**Solusi:** 
1. Pastikan domain sudah ditambahkan (Langkah 2)
2. Clear cache browser mobile
3. Test di incognito/private mode

### Environment Variables tidak terbaca

**Penyebab:** Environment variables tidak di-set dengan benar di Vercel

**Solusi:**
1. Cek di Vercel Dashboard → Settings → Environment Variables
2. Pastikan semua variable diawali dengan `VITE_`
3. Redeploy setelah menambahkan/mengubah env vars

## Cara Test

### Test di Mobile (Simulator)

1. Buka Chrome DevTools
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Pilih device mobile (iPhone, Android)
4. Refresh halaman
5. Coba login dengan Google

### Test di Mobile (Real Device)

1. Buka URL Vercel di browser mobile
2. Coba login dengan Google
3. Akan redirect ke Google login
4. Setelah login, akan redirect kembali ke app

## Catatan Penting

- **signInWithPopup** digunakan untuk desktop (lebih smooth)
- **signInWithRedirect** digunakan untuk mobile (lebih reliable)
- Deteksi mobile berdasarkan user agent dan screen width
- Redirect memerlukan domain yang valid di Firebase Console

## Kontak Support

Jika masih ada masalah:
1. Cek browser console untuk error detail
2. Cek Network tab untuk melihat request yang gagal
3. Pastikan Firebase project tidak dalam maintenance mode
