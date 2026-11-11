🌸 Sakura PC Hardware MonitorSakura PC Hardware Monitor adalah aplikasi monitoring hardware komputer real-time berbasis Python Web Server (FastAPI + WebSocket) dan Progressive Web App (PWA). Aplikasi ini dirancang untuk dijalankan di PC Windows sebagai server monitoring dan dapat diakses dari berbagai perangkat (Smartphone Android/iOS, Tablet, atau Laptop) di jaringan Wi-Fi/LAN yang sama dengan antarmuka estetis bertema Japanese Sakura Glassmorphism.✨ Fitur Utama⚙️ CPU Monitoring: Deteksi otomatis model CPU, persentase penggunaan real-time, clock speed (GHz), serta jumlah physical & logical cores.🧠 RAM Monitoring: Pelacakan kapasitas RAM total, RAM terpakai, RAM bebas, dan persentase penggunaan dengan visualisasi progress bar.🎮 GPU Monitoring: Deteksi GPU NVIDIA secara otomatis (via PyNVML) mencakup suhu (°C), persentase penggunaan, serta alokasi VRAM.🖥️ Active Session & Display: Deteksi aplikasi Windows yang sedang aktif (foreground application), judul window aktif, serta resolusi dan refresh rate monitor via Windows API (pywin32).🌐 Network Traffic: Monitoring kecepatan Download & Upload real-time (MB/s) beserta akumulasi total penggunaan data.💾 Storage Monitoring: Monitoring otomatis seluruh drive/partisi storage (C:, D:, dll.) beserta kapasitas terpakai dan sisa ruang.📊 Top 5 Processes: Menampilkan 5 proses teratas berdasarkan penggunaan CPU tertinggi secara real-time beserta PID dan alokasi memori (MB).📱 Progressive Web App (PWA): Dapat di-install langsung ke layar utama smartphone/tablet melalui browser (Chrome/Safari) dan berjalan dalam mode fullscreen standalone.⚡ Keep On (Screen Wake Lock): Mencegah layar smartphone mati/redup saat dashboard digunakan sebagai layar pemantau fisik.🔄 Auto Reconnect System: Koneksi otomatis berbasis WebSocket dengan exponential backoff jika PC restart, server mati, atau sinyal Wi-Fi terputus.🛠️ Tech StackBackendPython 3.11+FastAPI & Uvicorn (Asynchronous Web Server & WebSocket Engine)psutil (CPU, RAM, Network, Storage, & Process Monitoring)pynvml (NVIDIA Management Library for GPU metrics)pywin32 & WMI (Windows API untuk deteksi aplikasi foreground & display)FrontendHTML5 & CSS3 (Custom Responsive 3-Column Grid & Glassmorphism Aesthetics)Vanilla JavaScript (DOM caching untuk optimasi performa, Standalone Digital Clock, WebSocket handler)PWA Service Worker & Web App Manifest📁 Struktur ProjectPlaintextsakura-pc-monitor/
│
├── main.py                 # FastAPI server & WebSocket endpoint (dengan dukungan PyInstaller)
├── requirements.txt        # Daftar dependency Python
├── install.bat             # Script otomatis instalasi dependency
├── start.bat               # Script pengoperasian server (Clean Terminal Log)
├── build_portable.bat      # Script pembangun versi Portable (.exe)
├── README.md               # Dokumentasi project
│
├── backend/
│   ├── __init__.py
│   └── monitor.py          # Pembacaan sensor hardware & Windows API
│
└── frontend/
    ├── index.html          # Dashboard HTML
    ├── style.css           # Glassmorphism & Sakura Theme
    ├── app.js              # WebSocket Logic & DOM Handler
    ├── manifest.json       # Web App Manifest PWA
    ├── service-worker.js   # Service Worker for PWA Caching
    └── assets/
        ├── icon-192.png    # Ikon PWA 192x192
        └── icon-512.png    # Ikon PWA 512x512
🚀 Cara PenggunaanOpsi 1: Menjalankan via Python (Source Code)Install Dependencies:
Jalankan file install.bat atau ketik perintah berikut di Command Prompt:DOSpip install -r requirements.txt
Menjalankan Server:
Klik dua kali file start.bat. Jendela terminal akan menampilkan petunjuk penggunaan dan URL akses jaringan lokal:Plaintext👉  http://192.168.1.X:8000
Opsi 2: Menjalankan Mode Portable (.exe Tanpa Instalasi Python)Jalankan build_portable.bat untuk merakit project menjadi satu folder executable mandiri.Buka folder dist/SakuraMonitor/ dan jalankan SakuraMonitor.exe.🌐 Konfigurasi Jaringan & Windows FirewallAgar perangkat lain (Smartphone, Tablet, atau Laptop lain) di jaringan Wi-Fi/LAN yang sama dapat mengakses dashboard:Buka Command Prompt (Run as Administrator) di PC Server.Jalankan perintah berikut untuk membuka port 8000:DOSnetsh advfirewall firewall add rule name="Sakura PC Monitor" dir=in action=allow protocol=TCP localport=8000
📱 Instalasi PWA di SmartphoneHubungkan smartphone ke jaringan Wi-Fi yang sama dengan PC Server.Buka browser (Chrome di Android, Safari di iOS) lalu akses URL server (contoh: [http://192.168.1.10:8000](http://192.168.1.10:8000)).Install Aplikasi:Android (Chrome): Ketuk titik tiga (⋮) di pojok kanan atas $\rightarrow$ Pilih "Add to Home screen" / "Install app".iOS (Safari): Ketuk tombol Share (⬆) $\rightarrow$ Pilih "Add to Home Screen".Buka Sakura Monitor langsung dari home screen smartphone Anda untuk tampilan fullscreen tanpa address bar.📄 Catatan Sensor & PerformaTanpa Data Dummy: Semua data yang ditampilkan berasal langsung dari sensor sistem dan Windows API.Optimasi Performa: Pengambilan data storage diperbarui setiap 5 detik, sedangkan CPU, RAM, dan Network diperbarui setiap 1 detik untuk menjaga beban CPU server tetap minim.Dukungan GPU: Fitur sensor GPU dioptimalkan untuk kartu grafis NVIDIA. Jika PC menggunakan integrated graphics tanpa dukungan PyNVML, panel GPU secara otomatis menampilkan status Not Supported.
