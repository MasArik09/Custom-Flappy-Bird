# System Design Document (SDD) - Custom Flappy Bird Project

## 1. System Architecture & Component Diagram

Aplikasi ini menggunakan pendekatan Object-Oriented Programming (OOP) dengan pola Game Loop Pattern dan State Machine sederhana. Seluruh alur data dikendalikan secara terpusat (Centralized Architecture) untuk menjamin kemudahan pelacakan jika terjadi error.

Berikut adalah cetak biru relasi antar-komponen dan aliran data di dalam sistem:

+-------------------------------------------------------+
|                       main.js                         |
|   (Entry Point, Inisialisasi Game & Event Listeners)  |
+--------------------------+----------------------------+
                           |
                           v
+-------------------------------------------------------+
|                       Game.js                         |
|   (Master Controller, Game Loop, & State Machine)     |
+--------+--------------+--------------+---------+------+
         |              |              |         |
         v              v              v         v
    +---------+    +---------+    +---------+    +----------+
    | Bird.js |    | Pipe.js |    |  UI.js  |    | Audio.js |
    +---------+    +---------+    +---------+    +----------+

---

## 2. Class Definitions & Specifications

### 2.1 Game Master Controller (Game.js)
Kelas ini bertindak sebagai otak utama permainan yang mengatur transisi layar (state) dan memicu pembaruan logika serta penggambaran objek.

* Properties:
    * canvas: Referensi langsung ke elemen DOM HTML5 Canvas.
    * ctx: Konteks grafis 2D Canvas untuk menggambar objek.
    * currentState: Teks String penanda state aktif ('MENU', 'PLAYING', 'PAUSED', 'GAMEOVER').
    * bird: Instansiasi dari kelas Bird.
    * pipes: Array terpusat untuk menampung seluruh objek Pipe yang aktif.
    * ui: Instansiasi dari kelas UI yang bersifat pasif.
    * audio: Instansiasi dari kelas Audio.
    * currentDistance: Angka desimal penyimpan jarak saat ini dalam satuan meter.
    * highScore: Angka penyimpan skor tertinggi (bertahan selama tab browser tidak di-refresh).

* Methods:
    * init(): Menyiapkan event listeners global, mengeset ukuran canvas, dan menginisialisasi objek awal.
    * start(): Memulai loop permainan menggunakan requestAnimationFrame.
    * loop(timestamp): Fungsi berkala yang menghitung delta time dan memanggil update() serta draw() sebanyak 60 FPS.
    * update(dt): Memperbarui logika berdasarkan currentState. Jika berada di state 'PLAYING', fungsi ini memperbarui jarak, mengecek ambang batas kesulitan (difficulty thresholds), memicu pembaruan objek burung, serta menghapus pipa yang keluar layar menggunakan fungsi array shift().
    * draw(): Membersihkan canvas via clearRect() dan memerintahkan komponen Bird, Pipe, dan UI untuk menggambar diri mereka sesuai state yang aktif.
    * changeState(newState): Mengatur perpindahan state layar dan memicu logika transisi suara atau musik latar.
    * handleInput(eventType, eventData): Gerbang utama penangkap input dari main.js. Mengarahkan aksi lompatan ke kelas Bird atau aksi tombol ke kelas UI secara satu pintu.

### 2.2 Bird Component (Bird.js)
Kelas yang bertanggung jawab penuh terhadap kalkulasi fisika pergerakan karakter, penanganan input mekanik lompat/terbang, dan manajemen masa kebal (i-frames).

* Properties:
    * x, y: Koordinat posisi pusat burung pada canvas.
    * radius: Ukuran tubuh burung untuk kebutuhan kalkulasi visual lingkaran dan ukuran hitbox.
    * velocityY: Kecepatan gerak vertikal objek burung.
    * gravity: Nilai konstanta gaya tarik ke bawah yang stabil dan konstan (linear).
    * jumpForce: Impuls instan ke atas saat tombol dilepas atau diklik singkat.
    * flyAcceleration: Gaya dorong ke atas kontinu saat tombol ditekan lama (long press).
    * isInvincible: Status boolean kekebalan burung pasca-tabrakan agar tidak langsung mati beruntun.
    * invincibilityTimer: Penghitung mundur durasi sisa masa kebal (diset selama 1.5 detik).
    * blinkTimer: Variabel bantu untuk mengatur efek visual berkedip (blinking effect) burung saat kebal.
    * hp: Jumlah sisa nyawa burung (diinisialisasi berangka awal 3).

* Methods:
    * update(dt, isLongPress): Menghitung perpindahan posisi y berdasarkan velocityY dan gravity. Jika isLongPress bernilai true, aplikasikan variabel flyAcceleration. Fungsi ini juga otomatis mengelola pengurangan invincibilityTimer.
    * draw(ctx): Menggambar bentuk lingkaran murni representasi burung menggunakan fungsi ctx.arc(). Jika isInvincible aktif, manipulasi nilai opacity canvas menggunakan globalAlpha secara berkala untuk menciptakan efek berkedip.
    * flap(): Mengatur kecepatan vertikal secara instan untuk melompat ke atas (velocityY = -jumpForce).
    * triggerInvincibility(): Mengaktifkan status isInvincible = true selama 1.5 detik dan mengurangi hp sebanyak 1 poin.

### 2.3 Pipe Component (Pipe.js)
Kelas rintangan yang mengatur pembuatan sepasang pipa (atas dan bawah), pergerakan horizontal ke kiri, serta fase pergerakan dinamis vertikal.

* Properties:
    * x: Posisi koordinat horizontal pipa di ujung kanan canvas saat pertama kali muncul.
    * width: Lebar pipa secara horizontal (nilainya statis).
    * topHeight: Tinggi pipa bagian atas yang nilainya di-generate secara acak.
    * gap: Lebar celah vertikal kosong di antara kedua pipa tempat burung lewat (nilainya statis).
    * bottomY: Koordinat titik awal mulainya pipa bagian bawah yang dihitung dari topHeight ditambah gap.
    * speed: Kecepatan gerak horizontal mundur ke kiri mengikuti tingkat difficulty game.
    * isDynamic: Boolean penanda apakah pipa ini masuk dalam fase bergerak naik-turun atau tidak.
    * verticalSpeed: Kecepatan gerak vertikal tetap khusus untuk pipa dinamis.
    * direction: Arah gerak vertikal (bernilai 1 untuk bergerak ke bawah, dan -1 untuk ke atas).
    * hasPassed: Boolean penanda untuk memastikan pipa ini hanya menyumbang skor bonus sekali saja setelah seluruh badan burung melewatinya.

* Methods:
    * update(dt, currentDistance): Mengurangi posisi x berdasarkan speed lingkungan. Jika properti isDynamic aktif, posisi vertikal pipa diubah secara konstan menggunakan perkalian antara verticalSpeed dan direction. Lakukan pembalikan arah gerak (direction dikali -1) jika gerakan pipa menyentuh batas ambang toleransi atas atau bawah layar.
    * draw(ctx): Menggambar sepasang kotak rintangan (pipa atas dan bawah) secara murni memanfaatkan fungsi ctx.fillRect().

### 2.4 UI & HUD Component (UI.js)
Kelas pasif yang bertugas menerima data mentah dari Game.js untuk dirender menjadi representasi teks visual di atas canvas permainan. Kelas ini terisolasi dari kalkulasi logika game.

* Methods:
    * drawHUD(ctx, score, hp, isMuted): Menggambar teks skor jarak (meter), merender jumlah sisa nyawa dalam bentuk ikon hati/kotak kecil sejumlah variabel hp, dan menampilkan indikator audio di pojok layar.
    * drawMenu(ctx): Menggambar teks judul game di tengah, panduan tombol kontrol permainan, serta opsi tombol Start Game dan tombol Mute/Unmute.
    * drawPause(ctx): Menggambar lapisan transparan overlay hitam tipis di atas canvas beserta teks panduan "PAUSED - Click Resume to Continue".
    * drawGameOver(ctx, finalScore, highScore): Menggambar statistik skor akhir sesi permainan, menampilkan rekor skor tertinggi saat itu, dan menampilkan tombol visual Restart Game.

### 2.5 Audio Component (Audio.js)
Kelas wrapper penanganan audio yang mengelola inisialisasi berkas suara dan menaati kebijakan keamanan browser modern (Autoplay Policy).

* Properties:
    * ctx: Audio context yang baru diaktifkan pasca-klik pertama pengguna.
    * sounds: Objek pencatat koleksi audio untuk memetakan nama audio seperti flap, hit, score, dan bgm.
    * isMuted: Status global keheningan audio permainan yang diatur lewat tombol menu.

* Methods:
    * resumeContext(): Mengaktifkan konteks Web Audio API setelah interaksi klik pertama pengguna di halaman web agar tidak diblokir browser.
    * playBGM(): Memutar musik latar secara berulang terus-menerus (looping).
    * stopBGM(): Menghentikan putaran musik latar secara total.
    * playSFX(soundName): Memainkan efek suara pendek secara instan ('flap', 'hit', atau 'score') selama status isMuted bernilai false.
    * toggleMute(): Membalikkan nilai boolean isMuted untuk mematikan atau menyalakan seluruh suara di dalam game secara global.

---

## 3. Core Algorithms & Logic Implementation

### 3.1 Algoritma Circle-to-Rectangle Collision Detection
Deteksi tabrakan antara komponen Bird (Lingkaran) dengan komponen Pipe (Kotak) wajib ditulis menggunakan struktur kode berikut:

+-----------------------------------------------------------------------------------+
|  function checkCollision(bird, pipeBox) {                                         |
|      let closestX = Math.max(pipeBox.x, Math.min(bird.x, pipeBox.x + pipeBox.width));|
|      let closestY = Math.max(pipeBox.y, Math.min(bird.y, pipeBox.y + pipeBox.height));|
|      let distanceX = bird.x - closestX;                                           |
|      let distanceY = bird.y - closestY;                                           |
|      let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);      |
|      return distanceSquared < (bird.radius * bird.radius);                        |
|  }                                                                                |
+-----------------------------------------------------------------------------------+

### 3.2 Difficulty Scaling (Ambang Jarak)
Peningkatan kecepatan permainan diset melompat secara signifikan berdasarkan tingkat kemajuan meter jarak pemain demi menjaga aspek permainan yang tetap menantang namun tetap playable:
- Jarak 0 meter sampai 50 meter (Easy Mode): Kecepatan scroll pipa diset statis pada angka 3.0.
- Jarak 51 meter sampai 100 meter (Medium Mode): Kecepatan scroll pipa melompat naik ke angka 4.2.
- Jarak 101 meter ke atas (Hard Mode): Kecepatan scroll pipa melompat naik ke angka maksimal 5.5.

### 3.3 Dynamic Obstacle (Pipa Bergerak Linier)
Logika pengaktifan fase rintangan pipa bergerak naik-turun dikendalikan terpusat menggunakan implementasi cetak biru logika berikut:

+-----------------------------------------------------------------------------------+
|  let distanceTrigger = Math.floor(this.currentDistance);                          |
|  let isEventActive = (distanceTrigger % 100 >= 0 && distanceTrigger % 100 <= 15)  |
|                      && (distanceTrigger >= 100);                                 |
|                                                                                   |
|  if (isEventActive) {                                                             |
|      this.pipes.push(new Pipe(canvas.width, currentSpeed, true));                 |
|  } else {                                                                         |
|      this.pipes.push(new Pipe(canvas.width, currentSpeed, false));                |
|  }                                                                                |
+-----------------------------------------------------------------------------------+