# Task Breakdown & Implementation Backlog - Custom Flappy Bird Project

Dokumen ini berisi daftar urutan tugas teknis yang dipecah secara granular (per fungsi spesifik). Gunakan dokumen ini sebagai panduan bertahap untuk diumpankan satu per satu kepada AI Agent (Google Antigravity) guna meminimalisir kesalahan logika.

---

## FASE 1: Setup Pondasi (Skeleton Proyek & Game Loop)

### Tugas 1.1: Pembuatan Berkas index.html & style.css
* **Deskripsi:** Buat struktur DOM dasar dan penataan layout halaman.
* **Target Spesifik:**
  - Buat `index.html` dengan satu elemen `<canvas id="gameCanvas">` dan tag script `type="module" src="src/main.js"`.
  - Buat `style.css` untuk mengatur posisi canvas agar selalu berada di tengah layar monitor PC (Centering via Flexbox/Grid) dengan warna latar belakang luar canvas abu-abu gelap.

### Tugas 1.2: Inisialisasi Entry Point (main.js)
* **Deskripsi:** Buat gerbang masuk eksekusi JavaScript.
* **Target Spesifik:**
  - Impor kelas `Game` dari `./Game.js`.
  - Lakukan instansiasi objek game baru (`const game = new Game();`).
  - Panggil fungsi `game.init()` untuk pertama kali saat dokumen selesai dimuat.

### Tugas 1.3: Pembuatan Sistem Kendali Utama (Game.js - Bagian I)
* **Deskripsi:** Bangun struktur Master Controller dan Game Loop 60 FPS.
* **Target Spesifik:**
  - Buat kelas `Game` di dalam `src/Game.js`.
  - Di dalam konstruktor, tangkap referensi elemen canvas dan set konteks grafis ke `2d`. Set dimensi canvas internal secara statis ke rasio monitor lanskap (misal `width = 960`, `height = 540`).
  - Buat properti `currentState` dengan nilai awal string `'MENU'`.
  - Buat fungsi `start()` dan `loop(timestamp)` menggunakan fungsi `requestAnimationFrame` untuk mengunci pergerakan pada performa stabil 60 FPS menggunakan kalkulasi delta time (selisih waktu antar-frame).
  - Buat fungsi stub kosong untuk `update(dt)`, `draw()`, dan `changeState(newState)`.

---

## FASE 2: Karakter Utama & Physics (Bird Component)

### Tugas 2.1: Pembuatan Properti Awal Karakter (Bird.js)
* **Deskripsi:** Buat kelas representasi karakter burung dengan variabel fisikanya.
* **Target Spesifik:**
  - Buat kelas `Bird` di dalam `src/Bird.js` beserta properti konstruktor: `x` (posisi horizontal awal), `y` (posisi vertikal tengah), `radius = 16`, `velocityY = 0`, `gravity = 0.35`, `jumpForce = 5.2`, `flyAcceleration = 0.20`, `terminalVelocity = 8.0`, `hp = 3`, dan `isInvincible = false`.

### Tugas 2.2: Logika Pergerakan Vertikal & Gambar (Bird.js)
* **Deskripsi:** Terapkan kalkulasi jatuh bebas dan penggambaran bentuk visual karakter.
* **Target Spesifik:**
  - Buat fungsi `update(dt, isLongPress)`. Jika `isLongPress` bernilai salah, tambahkan `velocityY` dengan `gravity`. Jika `isLongPress` bernilai true, kurangi `velocityY` dengan `flyAcceleration` untuk membuat efek terbang ke atas secara kontinu.
  - Batasi nilai maksimal kecepatan jatuh (*terminal velocity*) agar burung tidak melesat terlalu cepat ke bawah.
  - Buat fungsi `draw(ctx)` untuk menggambar tubuh burung berupa lingkaran murni menggunakan metode `ctx.arc()` dengan warna kuning dasar (`ctx.fillStyle = 'yellow'`).

### Tugas 2.3: Fungsi Refleks Lompat (Bird.js)
* **Deskripsi:** Sediakan metode untuk merespons ketukan input singkat pemain.
* **Target Spesifik:**
  - Buat fungsi `flap()` yang secara instan merubah nilai properti `velocityY` menjadi minus `jumpForce` (`velocityY = -jumpForce`) untuk memicu dorongan melompat instan ke atas.

---

## FASE 3: Rintangan & Pergerakan (Pipe Component)

### Tugas 3.1: Pembuatan Properti Rintangan (Pipe.js)
* **Deskripsi:** Buat kelas cetak biru untuk sepasang pipa rintangan.
* **Target Spesifik:**
  - Buat kelas `Pipe` di dalam `src/Pipe.js` dengan properti konstruktor: `x` (posisi awal di ujung kanan layar), `width = 40`, `speed = 3.0`, `gap = 170` (lebar celah vertikal kosong), `topHeight` (tinggi acak untuk pipa atas), `bottomY = topHeight + gap`, `isDynamic` (boolean), dan `hasPassed = false`.

### Tugas 3.2: Logika Pergerakan Horizontal & Gambar Pipa (Pipe.js)
* **Deskripsi:** Terapkan kalkulasi laju pipa mundur ke arah kiri.
* **Target Spesifik:**
  - Buat fungsi `update(dt)` untuk mengurangi nilai koordinat `x` dengan variabel `speed`.
  - Buat fungsi `draw(ctx)` untuk menggambar dua bentuk kotak persegi panjang murni (pipa atas dari koordinat 0 sampai `topHeight`, pipa bawah dari koordinat `bottomY` sampai batas bawah layar) memakai instruksi `ctx.fillRect()` berwarna hijau dasar.

### Tugas 3.3: Manajemen Array Pipa Terpusat (Game.js - Bagian II)
* **Deskripsi:** Kelola siklus hidup kemunculan pipa rintangan di dalam loop utama permainan.
* **Target Spesifik:**
  - Inisialisasi properti array kosong `this.pipes = []` di dalam konstruktor `Game.js`.
  - Buat logika berkala di dalam fungsi `update()` untuk melahirkan objek `new Pipe()` baru setiap kali pipa terakhir di dalam array sudah berjarak horizontal sejauh 200 pixel.
  - Tambahkan fungsi manajemen memori: Lakukan pemeriksaan di setiap frame, jika koordinat `x` suatu pipa ditambah lebar `width`-nya sudah bernilai kurang dari 0 (artinya sudah hilang total di sebelah kiri layar), hapus objek pipa tersebut dari array menggunakan perintah fungsi `this.pipes.shift()`.

---

## FASE 4: Manajemen Layar & Tampilan Visual (UI Component)

### Tugas 4.1: Pembuatan Fungsi Pasif Rendering UI (UI.js)
* **Deskripsi:** Bangun kelas khusus untuk menangani penggambaran teks informasi permainan.
* **Target Spesifik:**
  - Buat kelas `UI` di dalam `src/UI.js` tanpa memegang status variabel logika mandiri.
  - Buat fungsi `drawMenu(ctx)` untuk menggambar teks judul besar "CUSTOM FLAPPY BIRD", teks petunjuk cara bermain, dan sebuah kotak persegi penanda tombol "START GAME".
  - Buat fungsi `drawHUD(ctx, score, hp)` untuk menggambarkan angka skor jarak (meter) di posisi tengah atas layar menggunakan ukuran huruf besar (misal font 32px Sans-Serif), serta menggambar 3 buah lambang hati berwarna merah di pojok kiri atas layar sebagai penanda sisa nyawa pemain menggunakan fungsi Canvas path.
  - Buat fungsi `drawPause(ctx)` untuk menggambar lapisan overlay transparan hitam (`rgba(0,0,0,0.5)`) memenuhi layar canvas beserta teks informasi "PAUSED".
  - Buat fungsi `drawGameOver(ctx, finalScore, highScore)` untuk merender teks "GAME OVER", rincian skor akhir sesi, skor tertinggi, dan kotak tombol interaktif "RESTART GAME".

---

## FASE 5: Logika Inti Permainan (Game Logic & Integration)

### Tugas 5.1: Pemusatan Deteksi Input & Transisi State (Game.js - Bagian III)
* **Deskripsi:** Atur fungsi penangkap input satu pintu dan implementasikan perpindahan layar.
* **Target Spesifik:**
  - Di dalam fungsi `init()` di `Game.js`, pasang event listener `keydown` (untuk mendeteksi Spacebar, Panah Atas, dan tombol P) serta event `mousedown`/`mouseup` pada canvas.
  - Buat fungsi `handleInput(eventType, eventData)`. Jika `currentState === 'MENU'` dan koordinat klik tetikus berada di dalam batas kotak tombol Start, panggil fungsi `changeState('PLAYING')`.
  - Jika `currentState === 'PLAYING'` dan tombol Spacebar ditekan singkat, panggil fungsi `this.bird.flap()`. Jika ditekan lama, oper flag boolean ke pembaruan kelas burung. Jika tombol P ditekan, rubah state ke `'PAUSED'`.
  - Jika `currentState === 'GAMEOVER'` dan tombol Restart diklik atau Spacebar ditekan, kembalikan variabel `hp = 3`, hapus seluruh isi array `this.pipes = []`, set skor jarak kembali ke angka 0, lalu pindahkan state kembali ke `'PLAYING'`.

### Tugas 5.2: Perhitungan Skor Jarak & Skor Bonus Pipa (Game.js - Bagian IV)
* **Deskripsi:** Implementasikan aturan pertambahan skor pemain.
* **Target Spesifik:**
  - Di dalam fungsi `update()` saat state aktif berstatus `'PLAYING'`, tambahkan nilai variabel `this.currentDistance` secara berkala berdasarkan hitungan waktu delta time (satuan meter).
  - Jalankan loop untuk memeriksa setiap pipa aktif di dalam array: jika posisi koordinat horizontal bagian belakang pipa (`pipe.x + pipe.width`) nilainya sudah lebih kecil dari posisi horizontal bagian depan burung (`bird.x - bird.radius`) dan properti `pipe.hasPassed === false`, maka berikan bonus skor tambahan yang signifikan, lalu ubah flag properti `pipe.hasPassed = true`.

### Tugas 5.3: Implementasi Algoritma Tabrakan & Masa Kebal i-Frames (Game.js & Bird.js)
* **Deskripsi:** Gabungkan fungsi deteksi tabrakan lingkaran-ke-kotak beserta efek pasca-tabrakan.
* **Target Spesifik:**
  - Tulis fungsi pembantu di dalam `Game.js` untuk mendeteksi tabrakan antara burung (lingkaran) dengan sepasang kotak pipa aktif menggunakan algoritma pencarian titik terdekat (*clamping method* Teorema Pythagoras).
  - Tulis pengecekan batas layar bawah (tanah) dan atas (langit) dengan memberikan toleransi longgar sebesar 5 pixel sebelum dinyatakan melanggar batas.
  - Jika tabrakan terdeteksi bernilai benar DAN properti burung `isInvincible` bernilai salah: Panggil fungsi `this.bird.triggerInvincibility()` untuk mengurangi nyawa `hp` sebanyak 1 poin dan mengaktifkan timer kebal selama 1.5 detik. Selama timer berjalan aktif, buat visual lingkaran burung berkedip secara periodik di fungsi `draw()` milik kelas `Bird.js`. Jika nyawa burung menyentuh angka 0, langsung ubah kondisi state permainan menuju `'GAMEOVER'`.

### Tugas 5.4: Implementasi Pipa Bergerak Vertikal & Difficulty Scaling (Pipe.js & Game.js)
* **Deskripsi:** Terapkan tantangan pergerakan pipa linier berkala dan peningkatan kecepatan berkala.
* **Target Spesifik:**
  - Di dalam fungsi pembaruan `Pipe.js`, jika properti `isDynamic` bernilai true, gerakkan ketinggian pipa atas dan pipa bawah naik-turun secara vertikal dengan kecepatan linear tetap sebesar `0.8`. Balikkan arah gerak secara instan jika batas tinggi pipa menyentuh ambang toleransi 50 pixel dari batas atas (`50px`) atau 320 pixel dari batas atas (`320px`) canvas.
  - Di dalam kelas `Game.js`, buat fungsi pengecekan thresholds kesulitan: Jika jarak pemain berada di rentang 0-100m set `speed = 3.0`, jika jarak berada di rentang 101-200m naikkan secara melompat ke `speed = 3.6`, dan jika jarak sudah melebihi 201m kunci kecepatan maksimal lingkungan permainan pada angka `4.4`.
  - Saat proses melahirkan objek pipa baru di `Game.js`, cek apakah angka pembulatan jarak saat ini merupakan kelipatan jarak 100 meter (dengan rentang toleransi sisa 0 sampai 15 meter). Jika iya, lahirkan objek pipa tersebut dengan memberikan parameter boolean `isDynamic = true` agar pipanya bergerak vertikal.

---

## FASE 6: Integrasi Audio & Web Audio API Wrapper (Audio.js)

### Tugas 6.1: Pembuatan Audio Wrapper & Kebijakan Autoplay Browser
* **Deskripsi:** Kelola sistem pemuatan suara dari link CDN eksternal gratis yang aman dari pemblokiran browser.
* **Target Spesifik:**
  - Buat kelas `Audio` di dalam `src/Audio.js`.
  - Sediakan objek variabel pencatat koleksi audio yang menampung link URL publik file `.mp3`/`.wav` gratisan dari repositori open-source terbuka untuk suara `flap`, `hit`, `score`, dan lagu musik latar `bgm`.
  - Buat fungsi `resumeContext()` yang terikat dengan aksi klik pertama pengguna di tombol "START GAME" pada layar Menu Utama untuk mengaktifkan izin AudioContext browser secara sah.
  - Buat fungsi `playBGM()` dengan menyalakan atribut properti `.loop = true`, fungsi `stopBGM()`, dan fungsi `playSFX(soundName)` untuk memicu suara efek pendek instan selama status variabel global properti `isMuted` bernilai salah.
  - Hubungkan fungsi `playSFX()` dan `playBGM()` ke dalam titik pemicu logika di `Game.js` yang sesuai (suara flap saat lompat, suara hit saat nyawa berkurang, suara score saat bonus pipa didapat, dan musik latar mati/menyala saat tombol mute di pojok layar menu diklik).