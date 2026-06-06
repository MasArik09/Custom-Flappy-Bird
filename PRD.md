# Product Requirement Document (PRD) - Custom Flappy Bird Project

## 1. Project Overview
Proyek ini adalah pengembangan game berbasis web (*web-based game*) bergenre *side-scrolling endless runner* yang diinspirasi oleh game klasik "Flappy Bird". Game ini memiliki beberapa modifikasi mekanik modern seperti sistem nyawa, perhitungan skor berbasis jarak, perubahan fase rintangan (pipa bergerak), dan peningkatan tingkat kesulitan (*difficulty scaling*) berbasis progres pemain. Target utama proyek ini dijalankan di lingkungan lokal/PC (tanpa server hosting aktif) dan dideploy ke GitHub Repository menggunakan kombinasi teknologi gratisan (HTML5 Canvas, Vanilla CSS, dan Vanilla JavaScript).

---

## 2. Core Gameplay & Mechanics (Physics & Logic)

### 2.1. Mekanik Kontrol & Pergerakan Burung (Flap Mechanics)
* **Input Utama:** Keyboard (Spacebar / Panah Atas) atau Klik Mouse.
* **Jenis Input & Respons:**
    * *Single Click / Tap:* Burung akan melesat ke atas dengan ketinggian lompatan statis yang instan.
    * *Long Press (Ditekan lama):* Burung akan terbang naik secara kontinu ke atas. Ketinggian terbang bertambah secara proporsional sesuai dengan durasi tombol ditekan oleh pemain.
* **Efek Gravitasi:** Konstan (tidak eksponensial). Ketika tidak ada input dari pengguna, burung akan jatuh ke bawah dengan kecepatan vertikal yang stabil/konstan guna memberikan predibilitas pergerakan yang tinggi bagi pemain.

### 2.2. Mekanik Rintangan (Pipa / Obstacles)
* **Jarak Horizontal:** Jarak antar pipa secara horizontal diatur selalu sama/konsisten di sepanjang permainan.
* **Lebar Celah Vertikal:** Tinggi celah kosong (tempat burung lewat) diatur statis dan konstan (tidak mengecil). Namun, posisi vertikal (ketinggian) celah tersebut di-generate secara acak pada setiap pipa baru.
* **Fase Pipa Bergerak (Dynamic Obstacle Phase):**
    * Mekanik ini aktif hanya ketika skor pemain sudah mencapai jarak/poin tertentu yang jauh.
    * Pipa akan bergerak naik-turun secara vertikal untuk menambah kesulitan.
    * Mekanik ini **bukan bersifat permanen**, melainkan sebuah *event* berkala yang hanya berlangsung selama beberapa saat, kemudian kondisi pergerakan pipa akan kembali normal (statis kembali).

### 2.3. Tingkat Kesulitan Berjenjang (Difficulty Scaling)
* Game menerapkan sistem *Speed Progression*. Seiring bertambah jauhnya jarak/skor pemain, **Kecepatan Scroll Lingkungan (Pipa dan Background bergerak ke kiri)** akan meningkat secara bertahap pada *threshold* (ambang batas) skor tertentu yang telah ditentukan (misal: bertambah cepat pada skor 50, dan bertambah cepat lagi pada skor 100).

---

## 3. Game Rules, Scoring, & Lifecycle

### 3.1. Sistem Perhitungan Skor (Scoring System)
Skor dihitung menggunakan akumulasi dari dua komponen:
1.  **Skor Jarak (Distance Score):** Skor otomatis bertambah secara berkala berdasarkan waktu bertahan hidup (dikonversikan ke dalam satuan Meter).
2.  **Skor Pipa (Obstacle Score):** Pemain mendapatkan bonus poin tambahan ketika berhasil melewati pipa. Skor pipa baru dinyatakan sah (bertambah) **tepat ketika seluruh badan burung telah melewati batas bagian belakang pipa**.

### 3.2. Sistem Nyawa & Kondisi Kalah (Hitbox & Health Points)
* **Sistem Nyawa:** Pemain dibekali dengan **3 Nyawa (Health Points/HP)** pada awal permainan.
* **Hitbox Pipa:** Sangat ketat (*strict hitbox*). Sentuhan sekecil apa pun antara badan burung dengan pipa akan mengurangi nyawa sebanyak 1 poin.
* **Hitbox Batas Atas/Bawah (Tanah & Langit):** Memiliki toleransi longgar (*forgiving hitbox*). Jika burung menyentuh batas tanah atau batas atas layar, diberikan toleransi sedikit sebelum nyawa berkurang.
* **Kondisi Game Over:** Game over hanya akan terpicu jika ke-3 nyawa pemain telah habis terpakai (HP = 0).

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