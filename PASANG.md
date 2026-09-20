# Cara memasang

Semua file di sini menggantikan yang lama. Struktur foldernya sudah sesuai repo.

## 1. Salin

```
content/                    → BARU
app/globals.css             → TIMPA
app/layout.tsx              → TIMPA
app/page.tsx                → TIMPA
app/components/Header.tsx           → BARU (ganti Navbar.tsx)
app/components/ThemeProvider.tsx    → TIMPA
app/components/Hero.tsx             → BARU
app/components/PixelReveal.tsx      → BARU
app/components/FeaturedBuild.tsx    → BARU
app/components/ProjectGrid.tsx      → BARU
app/components/ExperienceList.tsx   → BARU
app/components/StackGrid.tsx        → BARU
app/components/Contact.tsx          → BARU
app/components/SiteFooter.tsx       → BARU
```

## 2. Hapus yang tidak terpakai lagi

```
app/components/Navbar.tsx          app/components/Preloader.tsx
app/components/BentoProjects.tsx   app/components/DeveloperBadge.tsx
app/components/ThemeBackground.tsx app/hooks/  app/utils/anime.ts
components/ui/  components/demo-*.tsx
```

Lalu:
```bash
npm uninstall animejs framer-motion gsap @gsap/react react-icons
npm run build
```

Bundle-nya akan turun drastis — tiga library animasi hilang sekaligus.
GSAP tidak lagi dipakai karena satu-satunya motion non-interaktif sekarang
adalah animasi CSS `.rise` di `globals.css`.

## 3. Aset yang harus disiapkan

| File | Keperluan |
|---|---|
| `public/avatar.png` | Gambar penutup untuk efek pixel-reveal (ilustrasi/avatar) |
| `public/profile1.png` | **Kompres dulu** — sekarang 1,2 MB, target < 150 KB WebP |
| `public/projects/*.png` | Screenshot ASLI tiap project |
| `public/og.png` | 1200×630, untuk preview saat link dibagikan |

`GIF1.gif` (3,9 MB) tidak lagi dipakai — hapus.

## 4. Isi TODO di `content/`

Cari `TODO` di `content/site.ts`, `projects.ts`, `experience.ts`:

- **Email** — sekarang masih `GANTI@email.kamu`. Yang lama (`ridho@example.com`)
  adalah placeholder, jadi semua pesan selama ini hilang.
- **Nomor WhatsApp** — yang lama `629818775467` dimulai `9`. Nomor Indonesia
  selalu mulai `8` setelah `62`.
- **Angka konten** — pilih 600 **atau** 2000. Dua angka berbeda untuk pekerjaan
  yang sama membuat semua klaim lain ikut diragukan.
- **Outcome tiap project** — dipakai berapa orang, memangkas waktu apa.
  Kosongkan kalau memang belum ada; jangan dikarang.

## Yang sengaja tidak disalin dari referensi

**Centang biru.** Meniru lencana verifikasi Twitter/Meta padahal tidak ada yang
memverifikasi. Orang yang jeli membacanya sebagai meminjam kredibilitas, dan
efeknya kebalikan dari yang diinginkan.

**Navigasi tanpa Contact.** Di referensi, satu-satunya jalan ke kontak adalah
scroll sampai habis — padahal itu tujuan seluruh situs.

**CTA hero "View Resume".** Resume adalah bahasa rekruter, tapi bagian bawah
situsnya menjual jasa freelance. Di sini CTA hero netral ("See the work") dan
pemisahan audiens terjadi di section Contact lewat tiga pintu.

**Form kontak.** Situs ini static export — tanpa backend, form hanya menampung
pesan lalu membuangnya. Link langsung selalu bekerja.
