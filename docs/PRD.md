# Product Requirement Document (PRD) - Custom Flappy Bird Project

## 1. Project Overview
Proyek ini adalah pengembangan game berbasis web (*web-based game*) bergenre *side-scrolling endless runner* yang diinspirasi oleh game klasik "Flappy Bird". Game ini memiliki beberapa modifikasi mekanik modern seperti sistem nyawa, perhitungan skor berbasis jarak, perubahan fase rintangan (pipa bergerak), dan peningkatan tingkat kesulitan (*difficulty scaling*) berbasis progres pemain. Target utama proyek ini dijalankan di lingkungan lokal/PC (tanpa server hosting aktif) dan dideploy ke GitHub Repository menggunakan kombinasi teknologi gratisan (HTML5 Canvas, Vanilla CSS, dan Vanilla JavaScript).

---

## 2. Core Gameplay & Mechanics (Physics & Logic)

### 2.1. Mekanik Kontrol & Pergerakan Burung (Flap Mechanics)
* **Input Utama:** Keyboard (Spacebar / Panah Atas) atau Klik Mouse.
* **Jenis Input & Respons:**
    * *Single Click / Tap:* Burung melompat ke atas dengan impuls instan (`jumpForce = 5.2`).
    * *Long Press (Ditekan lama):* Burung terbang naik secara kontinu ke atas menggunakan akselerasi vertikal (`flyAcceleration = 0.20`).
* **Efek Gravitasi:** Kecepatan jatuh bertambah secara linier berdasarkan gravitasi (`gravity = 0.35`) hingga mencapai kecepatan jatuh maksimal (*terminal velocity = 8.0*) guna memberikan predibilitas pergerakan yang tinggi dan kontrol yang mantap bagi pemain.

### 2.2. Mekanik Rintangan (Pipa / Obstacles)
* **Jarak Horizontal:** Jarak spawn antar pipa diatur konsisten sebesar `200px` dari pipa sebelumnya.
* **Dimensi Pipa & Celah:** Lebar badan pipa adalah `40px` (dibuat ramping) dan tinggi celah vertikal kosong tempat lewat burung diatur statis sebesar `170px` (diperlebar) untuk kenyamanan manuver burung. Posisi vertikal celah di-generate secara acak di setiap kemunculan pipa.
* **Fase Pipa Bergerak (Dynamic Obstacle Phase):**
    * Mekanik ini aktif pada jarak $\ge 100$ meter dan hanya terpicu secara berkala (setiap kelipatan 100 meter, berlangsung selama 15 meter awal fase tersebut).
    * Pipa bergerak naik-turun secara vertikal dengan kecepatan linear stabil (`verticalSpeed = 0.8`) dan berbalik arah otomatis saat menyentuh batas atas (`50px`) atau batas bawah (`320px` tinggi pipa atas) layar.
    * Fase ini bersifat temporer, pipa baru setelah melewati rentang 15 meter akan kembali statis.

### 2.3. Tingkat Kesulitan Berjenjang (Difficulty Scaling)
* Game menerapkan sistem *Speed Progression* berbasis jarak (Meter):
    * **0 - 100 Meter (Easy):** Kecepatan scroll lingkungan = `3.0`.
    * **101 - 200 Meter (Medium):** Kecepatan scroll lingkungan = `3.6`.
    * **201+ Meter (Hard):** Kecepatan scroll lingkungan = `4.4`.

---

## 3. Game Rules, Scoring, & Lifecycle

### 3.1. Sistem Perhitungan Skor (Scoring System)
Skor dihitung menggunakan akumulasi dari dua komponen:
1.  **Skor Jarak (Distance Score):** Bertambah secara kontinu seiring waktu bertahan hidup (ditambahkan sebanyak 5 meter per detik).
2.  **Skor Pipa (Obstacle Score):** Pemain mendapatkan bonus tambahan sebesar **15 Meter** ketika berhasil melewati pipa (diukur tepat saat seluruh badan burung melewati batas bagian belakang pipa).

### 3.2. Sistem Nyawa & Kondisi Kalah (Hitbox & Health Points)
* **Sistem Nyawa:** Pemain dibekali dengan **3 Nyawa (HP)** di awal permainan.
* **Invincibility Frames (i-frames):** Ketika menabrak pipa, nyawa berkurang 1 HP dan burung masuk ke masa kebal selama **1.5 detik** (visual berkedip) untuk menghindari pengurangan nyawa beruntun pada rintangan yang sama.
* **Hitbox Pipa:** Sangat ketat sesuai radius fisik burung (`radius = 16px`) dan batas luar pipa.
* **Hitbox Batas Atas/Bawah (Tanah & Langit):** Memiliki toleransi longgar sebesar `5px` sebelum nyawa berkurang.
* **Kondisi Game Over:** Game over terpicu ketika HP mencapai 0.

### 3.3. Penyimpanan Skor Tertinggi (High Score Persistence)
* **State:** High Score disimpan di dalam memori aplikasi menggunakan variabel JavaScript runtime (bukan `localStorage`).
* **Aturan Reset:**
    * Jika pemain Kalah -> Masuk Layar Game Over -> Klik *Restart*, **High Score tetap tersimpan**.
    * Jika pemain melakukan *Refresh Browser* atau menutup tab, **High Score akan terhapus/kembali ke 0**.

---

## 4. User Interface (UI) & User Experience (UX) Flow

Game wajib menyediakan 4 kondisi layar (*Screen States*) utama:
1.  **Splash Screen / Main Menu:** * Menampilkan judul game.
    * Tombol *Start Game*.
    * Halaman Info / Cara Bermain.
    * Fitur *Audio Management* (Tombol Mute/Unmute suara game diletakkan di menu ini).
2.  **Gameplay Screen:**
    * Menampilkan visual game yang berjalan aktif (burung, pipa, background).
    * Menampilkan HUD (*Heads-Up Display*) berisi: Skor saat ini (Meter), Jumlah Sisa Nyawa (ikon hati/angka), dan tombol akses cepat untuk *Pause*.
3.  **Pause Screen:**
    * Dapat diakses di tengah permainan untuk menghentikan seluruh pergerakan objek sementara waktu (*freeze state*).
    * Menampilkan opsi untuk *Resume* (Melanjutkan kembali).
4.  **Game Over Screen:**
    * Muncul saat HP mencapai 0.
    * Menampilkan *Final Score* (Skor Akhir) dan *High Score* (Skor Tertinggi selama sesi berjalan).
    * Menampilkan tombol **Restart Game** (mereset permainan dari awal tanpa memicu refresh browser agar High Score tidak hilang).

---

## 5. Non-Functional & Technical Requirements

* **Platform Target:** Dioptimalkan khusus untuk pengguna PC / Laptop (Navigasi nyaman menggunakan Keyboard & Mouse).
* **Responsivitas Layar:** Tampilan game menggunakan HTML5 Canvas bersifat *responsive responsive-scale*, artinya canvas akan otomatis membesar/menyesuaikan ukuran untuk memenuhi seluruh layar (*fullscreen auto-scale*) baik pada monitor PC maupun layar HP.
* **Hosting & Deployment:** Tidak menggunakan hosting berbayar atau server *backend*. Eksekusi murni di sisi klien (*client-side*). Seluruh kode sumber dikelola menggunakan repositori Git dan di-push ke GitHub.
* **Aset & Kosmetik:** Menggunakan aset default standar/minimalis terlebih dahulu. Tidak ada fitur kosmetik toko (*skin shop*) pada versi ini.