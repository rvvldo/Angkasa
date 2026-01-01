# Fix 404 Error untuk Routes di Vercel

## Masalah

Ketika mengakses routes seperti `/admin/central` atau `/DashAdmin` secara langsung di Vercel, muncul error:
```
404: NOT_FOUND
```

## Penyebab

Vercel tidak tahu bahwa ini adalah Single Page Application (SPA) yang menggunakan client-side routing (React Router). Ketika user mengakses route secara langsung (bukan melalui navigasi internal), Vercel mencoba mencari file fisik di server, yang tidak ada.

## Solusi

### 1. Update `vercel.json`

Menambahkan `rewrites` untuk redirect semua routes ke `index.html`:

```json
{
  "buildCommand": "cd angkasa && npm install && npm run build",
  "outputDirectory": "angkasa/dist",
  "framework": "vite",
  "installCommand": "cd angkasa && npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Penjelasan:**
- `rewrites`: Semua request akan di-redirect ke `/index.html`
- `headers`: Cache control untuk optimasi
  - Root files: No cache (untuk index.html)
  - Assets: Long cache (untuk JS/CSS yang sudah di-hash)

### 2. Tambahkan `_redirects` File

File `angkasa/public/_redirects`:
```
/* /index.html 200
```

File ini akan di-copy ke `dist/_redirects` saat build dan berfungsi sebagai fallback untuk beberapa hosting platform.

## Cara Kerja

1. User mengakses `https://angkasaid.vercel.app/admin/central`
2. Vercel menerima request
3. Karena ada `rewrites` rule, Vercel serve `index.html`
4. React app load
5. React Router membaca URL dan render component yang sesuai (`CentralDashboard`)
6. User melihat halaman admin central

## Testing

### Test Lokal

```bash
cd angkasa
npm run build
npm run preview
```

Buka browser dan test routes:
- http://localhost:4173/admin/central
- http://localhost:4173/DashAdmin
- http://localhost:4173/forum

Semua seharusnya bekerja tanpa 404.

### Test di Vercel

1. Push perubahan ke Git
2. Vercel akan auto-deploy
3. Test routes di production:
   - https://your-app.vercel.app/admin/central
   - https://your-app.vercel.app/DashAdmin
   - https://your-app.vercel.app/forum

## Routes yang Tersedia

Berdasarkan `App.tsx`, routes yang tersedia:

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/daftar` - Register page
- `/user/:id` - Public profile

### Admin Central Routes (Protected)
- `/admin/central/login` - Admin central login
- `/admin/central` - Central dashboard
- `/admin/central/users` - User management
- `/admin/central/posts` - Post management
- `/admin/central/reports` - Reports

### Protected Routes (Require Login)
- `/forum` - Forum page
- `/profile` - User profile
- `/verify-email` - Email verification
- `/email` - Email inbox
- `/email/:id` - Email detail
- `/notifications` - Notifications

### DashAdmin Routes
- `/DashAdmin` - Admin dashboard
- `/DashAdmin/AdminDash` - Admin dashboard (alternative)

### Other
- `/maintenance` - Maintenance page

## Troubleshooting

### Masih 404 setelah deploy

**Solusi:**
1. Pastikan `vercel.json` ada di root project (bukan di folder angkasa)
2. Redeploy di Vercel
3. Clear browser cache
4. Test di incognito mode

### Routes bekerja di localhost tapi tidak di Vercel

**Solusi:**
1. Cek apakah `vercel.json` ter-commit ke Git
2. Cek Vercel build logs untuk error
3. Pastikan `outputDirectory` benar: `angkasa/dist`

### Assets tidak load

**Solusi:**
1. Cek base URL di `vite.config.ts`
2. Pastikan assets di-copy ke dist folder
3. Cek Network tab di browser DevTools

### Cache issue setelah deploy

**Solusi:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Test di incognito mode
4. Headers cache control sudah di-set dengan benar

## Catatan Penting

- **Jangan** hapus `_redirects` file dari `public` folder
- **Jangan** ubah `rewrites` di `vercel.json` tanpa testing
- **Selalu** test routes setelah deploy
- **Gunakan** incognito mode untuk test tanpa cache

## Verifikasi

Setelah deploy, verifikasi dengan:

1. **Direct URL Access**: Akses route langsung di browser
2. **Refresh**: Refresh halaman di route tertentu
3. **Bookmark**: Bookmark route dan buka dari bookmark
4. **Share Link**: Share link route ke orang lain

Semua seharusnya bekerja tanpa 404.

## Summary

✅ `vercel.json` updated dengan rewrites
✅ `_redirects` file ditambahkan
✅ Build berhasil
✅ File `_redirects` ada di dist
✅ Ready untuk deploy

Setelah push ke Git dan deploy, semua routes akan bekerja dengan baik!
