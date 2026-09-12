# Langit — Weather App

Tugas Rutin 5 — Pemrograman Web (3KOM40115) — JavaScript Modern ES6+

Weather app sederhana (vanilla HTML/CSS/JS) yang mengambil data cuaca dari **OpenWeatherMap API**.

## Cara menjalankan


4. Buka `index.html` langsung di browser (double click), atau jalankan lewat live server (VS Code extension "Live Server") supaya lebih nyaman saat development.
5. Saat pertama dibuka, halaman otomatis menampilkan cuaca **Medan**. Ketik nama kota lain di kolom pencarian untuk berpindah, misalnya `Jakarta`, `Tokyo`.


## Requirement yang dipenuhi

- [x] ES6+ — `const`/`let`, arrow function, template literals di seluruh `script.js`
- [x] `async/await` + Fetch API untuk request ke OpenWeatherMap
- [x] Menampilkan kota, suhu, deskripsi cuaca, ikon, dan kelembaban
- [x] Error handling — kota tidak ditemukan (404)
- [x] Error handling — network error (koneksi terputus)
- [x] Loading state saat fetch data
- [x] Array methods — `map`, `filter`(lewat `find`), dan `reduce` dipakai untuk mengelompokkan data forecast per hari
- [x] UI responsif (mobile-friendly)

## Fitur bonus

- [x] Riwayat pencarian tersimpan di `localStorage` (klik chip untuk mencari ulang)
- [x] Toggle satuan suhu °C / °F (bentuk switch geser)
- [x] Prakiraan cuaca 5 hari ke depan
- [x] Cuaca kota default (Medan) langsung tampil begitu halaman dibuka, tanpa perlu mencari dulu
- [x] Peta lokasi (Google Maps embed, tanpa API key tambahan) + panel info singkat (koordinat, zona waktu, matahari terbit/terbenam, waktu update terakhir)

## Struktur file

```
weather-app/
├── index.html
├── style.css
├── script.js
├── config.js            ← berisi API key asli, TIDAK di-commit
├── config.example.js    ← template, aman di-commit
├── .gitignore
└── README.md
```

## Cara push ke GitHub (sesuai format pengumpulan)

```bash
git init
git add .
git commit -m "Tugas Rutin 5: Weather App"
git branch -M main
git remote add origin https://github.com/<dhanyrolas21>/TugasWeb-Pertemuan5-WeatherApp.git
git push -u origin main
```

Dhany Rolas- Tugas-Mata-Kuliah-Pemrograman-Web-WeatherApp
