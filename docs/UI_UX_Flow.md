# UI/UX Flow & Screen Layout Document - Custom Flappy Bird Project

## 1. Screen State Transition Diagram

Game ini mengelola transisi visual antar-layar secara linear dan terpusat melalui status `currentState` pada `Game.js`. Berikut adalah peta alur perpindahan layarnya:

+-------------------------------------------------------------------+
|                            STATE: MENU                            |
|  - Menampilkan Judul Game & Instruksi                             |
|  - Tombol [START GAME] & Tombol [MUTE/UNMUTE] (Pojok Kanan Atas)  |
+---------------------------------+---------------------------------+
                                  |
                        Klik Tombol [START GAME]
                                  |
                                  v
+-------------------------------------------------------------------+
|                           STATE: PLAYING                          |
|  - Game Loop Aktif (Burung jatuh, pipa bergerak mundur)           |
|  - HUD: Skor Meter (Tengah Atas) & 3 Hati Merah (Pojok Kiri Atas)  |
|  - Input: Klik Mouse / Spacebar untuk Melompat / Terbang          |
+-------------------+- - - - - - - - - - - - - - -+-----------------+
                    |                             |
             Tekan Tombol [P]              Nyawa Habis (HP = 0)
                    |                             |
                    v                             v
+-----------------------------------+     +-------------------------+
|           STATE: PAUSED           |     |     STATE: GAMEOVER     |
|  - Logika Game Berhenti (Freeze)  |     |  - Game Over Overlay    |
|  - Overlay Gelap Tipis            |     |  - Skor Akhir & HighScore|
|  - Tekan [P] Lagi untuk Resume    |     |  - Tombol [RESTART GAME]|
+-----------------------------------+     +-------------------------+

---

## 2. Input Mapping per Screen State

Daftar penanganan input keyboard dan mouse dikunci secara ketat pada setiap kondisi layar guna menghindari tumpang tindih perintah:

- STATE: MENU
  * Klik Kiri Mouse pada Kotak [START] -> Memulai permainan, merubah state ke PLAYING.
  * Klik Kiri Mouse pada Ikon [MUTE] -> Membalikkan status suara (toggleMute()) di pojok atas.

- STATE: PLAYING
  * Klik Kiri / Tap Spacebar / Panah Atas -> Memicu impuls lompatan instan burung ke atas (flap()).
  * Tahan Klik / Tahan Spacebar (Long Press) -> Memicu akselerasi terbang kontinu ke atas.
  * Tekan Tombol [P] pada Keyboard -> Menghentikan permainan sementara, merubah state ke PAUSED.

- STATE: PAUSED
  * Tekan Tombol [P] pada Keyboard -> Melanjutkan kembali permainan, merubah state ke PLAYING.

- STATE: GAMEOVER
  * Klik Kiri Mouse pada Kotak [RESTART] -> Mereset HP ke 3, mengosongkan pipa, merubah state ke PLAYING.
  * Tekan Tombol Spacebar pada Keyboard -> Menjalankan fungsi Restart yang sama tanpa memicu refresh browser.

---

## 3. Visual Layout Reference (PC Monitor Grid Layout)

Karena game ini difokuskan penuh untuk tampilan layar monitor PC, area Canvas HTML5 dikunci menggunakan rasio lanskap standar (16:9) atau memenuhi layar dengan penempatan elemen HUD proporsional berbasis koordinat statis.

### 3.1 Layar Menu Utama (STATE: MENU)

+-------------------------------------------------------------------+
|                                            [ SPEAKER ICON (MUTE) ]|
|                                                                   |
|                        CUSTOM FLAPPY BIRD                         |
|                                                                   |
|                       +------------------+                        |
|                       |    START GAME    |                        |
|                       +------------------+                        |
|                                                                   |
|              [Kontrol: Spacebar / Mouse untuk Terbang]            |
+-------------------------------------------------------------------+

### 3.2 Layar Permainan (STATE: PLAYING)

+-------------------------------------------------------------------+
| [♥ ♥ ♥]                                 999 M                     |
| (3 Hati Merah)                      (Skor Jarak Besar)            |
|                                                                   |
|                 O  (Burung Bulat)                                 |
|                ---                                                |
|               |   |                                               |
|               | P | (Pipa Atas/Bawah Berubah Ketinggian)              |
|               | I |                                               |
|               | P |                                               |
|                ---                                                |
+-------------------------------------------------------------------+

### 3.3 Layar Game Over (STATE: GAMEOVER)

+-------------------------------------------------------------------+
|                                                                   |
|                            GAME OVER                              |
|                                                                   |
|                        Final Score: 120 M                         |
|                        High Score : 450 M                         |
|                                                                   |
|                       +------------------+                        |
|                       |   RESTART GAME   |                        |
|                       +------------------+                        |
|                                                                   |
+-------------------------------------------------------------------+

---

## 4. UX & Component Rendering Specifications

### 4.1 Modul Hati Merah (HP Component)
Sisa nyawa pemain digambar menggunakan geometri hati murni (*love shape*) lewat instruksi konteks Canvas 2D. Kelas `UI.js` menggambar bentuk hati sebanyak sisa variabel hp burung (maksimal 3):
- Menggunakan `bezierCurveTo` dengan koordinat lengkungan presisi untuk membentuk hati yang halus dan proporsional.
- Warna hati aktif menggunakan `#ff4757` (merah cerah) dan hati kosong menggunakan `rgba(255, 255, 255, 0.15)` (siluet transparan).
- Posisi diletakkan berjejer horizontal di pojok kiri atas canvas (mulai dari `x = 30px`, berjarak `35px` antar hati, ukuran `size = 22px`).

### 4.2 Tombol Interaktif (Start & Restart)
Kotak tombol Start dan Restart digambar menggunakan kombinasi `drawRoundedRect()` untuk latar kotak membulat dengan gradasi warna/transparansi, `strokeStyle` untuk garis tepi, dan `fillText()` untuk teks di dalamnya. Koordinat batas tombol (bounding box) didaftarkan ke `Game.js` agar deteksi klik mouse pengguna tepat mengenai area tombol tersebut.

### 4.3 Awan Latar Belakang (Background Clouds)
Latar belakang langit dilengkapi dengan awan putih halus yang melayang di belakang rintangan pipa untuk memberikan efek kedalaman (*depth*):
- Awan digambar secara prosedural menggabungkan beberapa lengkungan lingkaran (`ctx.arc()`) berwarna semi-transparan `rgba(255, 255, 255, 0.08)`.
- Menggunakan 4 awan yang bergerak ke kiri dengan kecepatan sangat lambat (`0.15` hingga `0.3`) untuk efek paralaks. Awan yang keluar dari kiri layar otomatis di-recycle ke sebelah kanan dengan posisi Y, skala, dan kecepatan acak.