# Software Requirements Specification (SRS) - Custom Flappy Bird Project

## 1. Introduction

### 1.1 Purpose
Dokumen ini mendefinisikan spesifikasi kebutuhan perangkat lunak secara teknis untuk proyek game web-based Custom Flappy Bird. Dokumen ini ditujukan sebagai panduan instruksi absolut bagi AI Agent (Google Antigravity) dalam menulis kode yang terstruktur, modular, mudah dirawat (maintainable), dan berkinerja tinggi.

### 1.2 System Architecture Overview
Aplikasi ini dibangun murni menggunakan arsitektur client-side tanpa membutuhkan server. Komponen utama sistem terdiri dari:
* HTML5 Canvas: Sebagai media rendering grafis utama.
* Vanilla CSS: Untuk penataan tata letak (layouting) layar menu, responsivitas kontainer game, dan estetika UI minimalis.
* ES6 Modules (JavaScript): Pemisahan kode program ke dalam modul-modul terpisah berbasis kelas (Class-based Modules) guna menjaga keterbacaan dan kemudahan pengembangan.

---

## 2. Architectural & File Structure Requirements

Kode program tidak boleh ditulis dalam satu file tunggal besar, melainkan harus dipecah menggunakan konsep ES6 Modules ke dalam struktur direktori dan berkas secara persis seperti di bawah ini:

|-- index.html          # Entry point utama aplikasi dan struktur DOM Canvas
|-- style.css           # Styling layouting, centering canvas, dan UI Screens
|-- src/                # Direktori utama kode sumber JavaScript
    |-- main.js         # Entry point JavaScript, inisialisasi game loop
    |-- Game.js         # State machine utama game, manajemen screen state, & core loop
    |-- Bird.js         # Logika physics burung, input handling, dan i-frames
    |-- Pipe.js         # Logika pembuatan pipa, pergerakan, dan fase dynamic obstacle
    |-- UI.js           # Manajemen rendering HUD, skor, nyawa, dan overlay screen
    |-- Audio.js        # Web Audio API wrapper untuk handling SFX dan BGM

---

## 3. Technical & Functional Specifications

### 3.1 Graphics Engine & Performance (Game Loop)
* Rendering Technology: Menggunakan konteks HTML5 Canvas 2D (canvas.getContext('2d')).
* Procedural Vector Graphics: Seluruh aset visual (burung, pipa, background) wajib digambar murni menggunakan fungsi bawaan Canvas (seperti fillRect, arc, beginPath, stroke) tanpa memuat file gambar eksternal (.png, .jpg, dsb). Hal ini untuk memastikan proyek tetap ringan, instan dimuat, dan bebas dari masalah broken file path.
* Frame Rate Lock: Pergerakan game wajib dikunci pada standar 60 FPS memanfaatkan requestAnimationFrame(). Perhitungan kalkulasi fisika pergerakan harus disinkronisasikan menggunakan delta time atau frame-rate independent scaling agar kecepatan objek konsisten di seluruh jenis monitor.

### 3.2 Component Specifications

#### A. Bird Component (Bird.js)
* Physics Properties: Memiliki variabel posisi (x, y), kecepatan vertikal (velocityY), dan nilai konstanta gravitasi tetap (gravity) yang konstan (not exponential) untuk menjamin pergerakan jatuh yang mudah diprediksi.
* Input Handling Logic:
    * Click/Tap/Spacebar: Memberikan impuls instan ke atas (velocityY = -jumpForce) untuk ketinggian melompat statis.
    * Long Press: Selama input ditahan, berikan akselerasi ke atas secara kontinu, membuat burung terbang naik secara proporsional sesuai dengan durasi tombol tekanan.
* Invincibility Frames (i-frames):
    * Memiliki flag boolean isInvincible (default: false) dan invincibilityTimer.
    * Ketika burung menabrak pipa, nyawa berkurang 1, dan isInvincible berubah menjadi true selama 1.5 detik.
    * Selama masa i-frames, burung kebal dari pengurangan nyawa akibat menabrak pipa kembali (mencegah mati beruntun dalam sekejap saat terjebak di pipa yang sama), dan visual burung digambar berkedip (blinking effect via modifikasi nilai opacity pada Canvas).

#### B. Pipe Component (Pipe.js)
* Movement Properties: Bergerak horizontal dari kanan ke kiri berdasarkan variabel speed (merepresentasikan burung bergerak maju). Kecepatan scroll lingkungan ini akan meningkat bertahap pada threshold skor tertentu sebagai bentuk difficulty scaling.
* Dynamic Obstacle Event Trigger:
    * Menerapkan pengecekan berkala berdasarkan variabel jarak saat ini (currentDistance).
    * Kondisi Event: Aktif setiap kelipatan jarak 100 meter.
    * Durasi Event: Berlangsung sejauh 15 meter sejak trigger aktif.
    * Perilaku Event: Pipa yang di-generate pada fase ini akan bergerak naik-turun secara vertikal menggunakan fungsi sinusoidal (Math.sin) untuk membatasi rentang pergerakannya secara halus. Setelah melewati batas 15 meter, pipa baru kembali ke kondisi statis (diam secara vertikal).

#### C. Audio Component (Audio.js)
* Menggunakan HTML5 Audio Element atau Web Audio API untuk memuat dan mengeksekusi efek suara.
* Wajib menyediakan fungsionalitas penanganan untuk 4 jenis audio dasar:
    1. flapSFX: Dimainkan setiap ada input lompatan.
    2. hitSFX: Dimainkan saat burung menabrak rintangan/kehilangan nyawa.
    3. scoreSFX: Dimainkan saat skor pipa bertambah.
    4. bgmMusic: Musik latar yang berputar terus-menerus (looping).
* Global Mute Logic: Menyediakan fungsi global toggleMute() untuk mematikan atau menyalakan seluruh suara berdasarkan interaksi pada Main Menu saja.

---

## 4. State & Screen Management

Sistem wajib mengelola 4 kondisi layar menggunakan manajemen state terpusat di Game.js:
1. State MENU: Merender judul game, instruksi kontrol, tombol start, dan tombol audio mute/unmute. Audio BGM dapat mulai di-play di sini pasca-interaksi user.
2. State PLAYING: Mengaktifkan pembaruan logika objek (Bird, Pipe) secara real-time, merender HUD (skor meter, ikon sisa nyawa, tombol pause). Skor bertambah lewat jarak (meter) dan bonus pipa (tepat saat seluruh badan burung melewati batas belakang pipa). Hitbox pipa sangat ketat, sedangkan batas atas/bawah layar diberi sedikit toleransi longgar.
3. State PAUSED: Menghentikan pembaruan logika objek (freeze state), merender teks "PAUSED" dan tombol resume di tengah canvas, namun mempertahankan data game di memori.
4. State GAMEOVER: Dipicu saat sisa nyawa = 0 (setelah 3 nyawa habis). Menampilkan skor akhir sesi tersebut, menampilkan nilai variabel High Score runtime, dan menyediakan tombol Restart. Aksi restart akan mereset status burung (posisi, nyawa kembali ke 3) dan menghapus array pipa, tanpa memicu fungsi window.location.reload(). Jika di-refresh manual atau tab ditutup, High Score baru akan kembali ke 0.

---

## 5. Non-Functional Technical Requirements

* Responsive Screen Scaling: Canvas wajib mendengarkan event window resize. Dimensi canvas internal secara dinamis menyesuaikan aspek rasio layar atau menggunakan penskalaan CSS (width: 100vw; height: 100vh; object-fit: contain;) agar proporsi visual tetap terjaga di semua resolusi layar monitor maupun layar HP (fullscreen auto-scale).
* Code Cleanliness: Kode harus bersih dari magic numbers. Nilai konstan seperti kecepatan awal, gravitasi, durasi i-frames, dan ambang batas kesulitan (difficulty thresholds) harus dideklarasikan sebagai variabel konfigurasi di bagian atas kelas atau file konfigurasi terpisah.