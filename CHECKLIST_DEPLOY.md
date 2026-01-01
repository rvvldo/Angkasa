# Checklist Deploy & Fix Google Login Mobile

## ✅ Yang Sudah Diperbaiki di Kode

1. **Mobile Detection & Redirect**
   - ✅ Menggunakan `signInWithRedirect` untuk mobile
   - ✅ Menggunakan `signInWithPopup` untuk desktop
   - ✅ Deteksi mobile berdasarkan user agent dan screen width

2. **Error Handling**
   - ✅ Error handling yang lebih detail di LoginPage
   - ✅ Logging error code dan message untuk debugging
   - ✅ Pesan error yang user-friendly

3. **Redirect Result Handler**
   - ✅ Menambahkan `getRedirectResult` di AuthProvider
   - ✅ Loading state untuk redirect process

4. **Firebase Config**
   - ✅ Debug logging untuk memastikan config terbaca
   - ✅ Environment variables sudah benar

5. **Build Optimization**
   - ✅ Manual chunks untuk vendor libraries
   - ✅ Build berhasil tanpa error

## ⚠️ YANG HARUS DILAKUKAN DI FIREBASE CONSOLE

### PENTING: Tambahkan Domain Vercel ke Firebase

**Ini adalah penyebab utama error "Gagal login dengan Google: Coba lagi"**

#### Langkah-langkah:

1. **Buka Firebase Console**
   - URL: https://console.firebase.google.com
   - Pilih project: **lascode-2fc55**

2. **Pergi ke Authentication Settings**
   - Klik **Authentication** di sidebar kiri
   - Klik tab **Settings** di bagian atas
   - Scroll ke **Authorized domains**

3. **Tambahkan Domain Vercel**
   - Klik tombol **Add domain**
   - Masukkan domain Vercel Anda, contoh:
     ```
     angkasaid.vercel.app
     ```
   - Atau jika menggunakan custom domain, tambahkan juga
   - Klik **Add**

4. **Tambahkan Domain Preview (Opsional)**
   - Untuk test preview deployment, tambahkan:
     ```
     *.vercel.app
     ```
   - Atau domain preview spesifik

5. **Verifikasi**
   - Pastikan domain muncul di list Authorized domains
   - Biasanya ada:
     - `localhost` (untuk development)
     - `lascode-2fc55.firebaseapp.com` (default)
     - `your-domain.vercel.app` (yang baru ditambahkan)

## ⚠️ YANG HARUS DILAKUKAN DI VERCEL DASHBOARD

### 1. Pastikan Environment Variables Sudah Di-set

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Pergi ke **Settings → Environment Variables**
4. Pastikan semua variable ini ada:

```env
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

5. Pastikan di-set untuk **Production**, **Preview**, dan **Development**

### 2. Redeploy Setelah Menambahkan Domain

1. Kembali ke **Deployments** tab
2. Klik **Redeploy** pada deployment terakhir
3. Atau push commit baru untuk trigger deployment

## 🧪 Cara Test

### Test di Desktop
1. Buka URL Vercel di browser desktop
2. Klik "Login dengan Google"
3. Popup akan muncul
4. Login dengan akun Google
5. Seharusnya berhasil redirect ke /forum

### Test di Mobile (Chrome DevTools)
1. Buka Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Pilih device mobile (iPhone, Android)
4. Refresh halaman
5. Klik "Login dengan Google"
6. Akan redirect ke Google login page
7. Login dengan akun Google
8. Akan redirect kembali ke app
9. Seharusnya berhasil login

### Test di Real Mobile Device
1. Buka URL Vercel di browser mobile (Chrome/Safari)
2. Klik "Login dengan Google"
3. Akan redirect ke Google login
4. Login dengan akun Google
5. Akan redirect kembali ke app
6. Seharusnya berhasil login

## 🐛 Troubleshooting

### Error: "The requested action is invalid"
**Penyebab:** Domain Vercel belum ditambahkan ke Firebase
**Solusi:** Ikuti langkah "Tambahkan Domain Vercel ke Firebase" di atas

### Error: "auth/unauthorized-domain"
**Penyebab:** Sama dengan di atas
**Solusi:** Tambahkan domain ke Firebase Console

### Error: "auth/invalid-api-key"
**Penyebab:** Environment variables tidak terbaca atau salah
**Solusi:** 
1. Cek Vercel Dashboard → Settings → Environment Variables
2. Pastikan semua variable ada dan benar
3. Redeploy

### Login berhasil di Desktop tapi gagal di Mobile
**Penyebab:** Domain belum ditambahkan atau cache browser
**Solusi:**
1. Pastikan domain sudah ditambahkan ke Firebase
2. Clear cache browser mobile
3. Test di incognito/private mode
4. Cek browser console untuk error detail

### Redirect loop atau stuck di loading
**Penyebab:** getRedirectResult tidak berhasil
**Solusi:**
1. Clear browser cache
2. Test di incognito mode
3. Cek browser console untuk error

## 📝 Catatan Penting

- **WAJIB** tambahkan domain Vercel ke Firebase Console
- Environment variables harus diawali dengan `VITE_`
- Redeploy setelah menambahkan env vars atau domain
- Test di incognito mode untuk menghindari cache issue
- Cek browser console untuk error detail

## ✅ Checklist Sebelum Deploy

- [ ] Domain Vercel sudah ditambahkan ke Firebase Console
- [ ] Environment variables sudah di-set di Vercel
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Test login Google di desktop (DevTools)
- [ ] Test login Google di mobile (DevTools)
- [ ] Push ke Git
- [ ] Deploy/Redeploy di Vercel
- [ ] Test di production URL
- [ ] Test di real mobile device

## 🎯 Expected Result

Setelah semua langkah di atas:
- ✅ Login dengan Google berhasil di desktop (popup)
- ✅ Login dengan Google berhasil di mobile (redirect)
- ✅ User ter-redirect ke /forum setelah login
- ✅ User data tersimpan di Firestore
- ✅ Tidak ada error di console

## 📞 Jika Masih Bermasalah

1. Cek browser console untuk error detail
2. Cek Network tab untuk melihat request yang gagal
3. Pastikan Firebase project tidak dalam maintenance
4. Coba test dengan akun Google yang berbeda
5. Coba clear cache dan cookies
