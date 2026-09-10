# Langit — Weather App

Tugas Rutin 5 — Pemrograman Web (3KOM40115) — JavaScript Modern ES6+

Weather app sederhana (vanilla HTML/CSS/JS) yang mengambil data cuaca dari **OpenWeatherMap API**.

## Cara menjalankan

1. Buat API key gratis di [openweathermap.org/api](https://openweathermap.org/api) (menu **API keys** setelah daftar/login). Key baru biasanya aktif dalam beberapa menit sampai 2 jam.
2. Salin `config.example.js` menjadi `config.js`:
   ```bash
   cp config.example.js config.js
   ```
3. Buka `config.js`, isi dengan API key Anda:
   ```js
   const API_KEY = "isi_key_anda_di_sini";
   ```
4. Buka `index.html` langsung di browser (double click), atau jalankan lewat live server (VS Code extension "Live Server") supaya lebih nyaman saat development.
5. Saat pertama dibuka, halaman otomatis menampilkan cuaca **Medan**. Ketik nama kota lain di kolom pencarian untuk berpindah, misalnya `Jakarta`, `Tokyo`.

### Soal keamanan API key

Untuk aplikasi frontend murni (HTML/CSS/JS tanpa server backend), API key **tidak bisa disembunyikan 100%** — begitu aplikasi berjalan di browser, siapa pun yang membuka tab Network di DevTools tetap bisa melihat key di URL request. Itu keterbatasan bawaan arsitektur client-side, bukan sesuatu yang bisa "diperbaiki" dari sisi kode saja.

Yang bisa dan sudah diterapkan di proyek ini:
- Key disimpan di `config.js`, file terpisah yang masuk daftar `.gitignore` — jadi key asli **tidak pernah ter-push ke GitHub public**. Ini melindungi dari ancaman paling umum, yaitu bot yang otomatis scan repository public untuk mencari API key yang bocor.
- `config.example.js` disediakan sebagai template kosong yang aman untuk di-commit, supaya siapa pun yang clone repo tahu harus mengisi key-nya sendiri.

Kalau butuh proteksi penuh (key benar-benar tidak terlihat siapa pun, termasuk lewat DevTools), solusinya adalah membuat backend/proxy server kecil yang menyimpan key di sisi server dan diteruskan ke OpenWeatherMap — di luar cakupan tugas "vanilla JS" ini, tapi jadi langkah lanjutan yang wajar kalau proyek ini dikembangkan lagi nanti.

> Kalau API key Anda pernah tersebar di tempat lain (chat, screenshot, commit lama), sebaiknya regenerate key baru dari dashboard OpenWeatherMap.

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

Pastikan repository dibuat dengan nama persis `TugasWeb-Pertemuan5-WeatherApp` dan visibility **Public**, lalu kumpulkan link repo-nya lewat LMS UNIMED.
