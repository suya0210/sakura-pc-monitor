@echo off
title Sakura PC Hardware Monitor Server
color 0D
cls

:: Deteksi IP Local IPv4 PC

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" /c:"Address"') do set IP=%%a
set IP=%IP: =%

cls
echo =========================================================================
echo                       SAKURA PC HARDWARE MONITOR 
echo =========================================================================
echo.
echo.  [ STATUS SERVER ] : BERJALAN DAN SIAP DIGUNAKAN
echo.
echo   -----------------------------------------------------------------------
echo    CARA TERHUBUNG DARI SMARTPHONE / LAPTOP LAIN:
echo   -----------------------------------------------------------------------
echo   1. Pastikan HP/Laptop terhubung ke Wi-Fi / Jaringan LAN yang SAMA.
echo   2. Buka Browser (Chrome / Safari / Edge).
echo   3. Masukkan alamat URL berikut di browser HP:
echo.
echo        http://%IP%:8000
echo.
echo   -----------------------------------------------------------------------
echo    CARA INSTALL APLIKASI PWA (FULLSCREEN / STANDALONE):
echo   -----------------------------------------------------------------------
echo   * Android (Chrome) : Ketuk titik tiga (:) - Pilih "Add to Home screen" / "Install app"
echo   * iOS (Safari)     : Ketuk tombol Share  - Pilih "Add to Home Screen"
echo.
echo   -----------------------------------------------------------------------
echo    TIPS PENGGUNAAN:
echo   -----------------------------------------------------------------------
echo   - Aktifkan tombol  "Keep On" di dashboard HP agar layar tidak redup/mati.
echo   - Jangan tutup jendela terminal ini selama monitoring berlangsung.
echo.
echo =========================================================================
echo   Tekan [Ctrl + C] atau tutup jendela ini untuk menghentikan server.
echo =========================================================================
echo.

:: Menjalankan Uvicorn dengan --log-level error agar terminal bersih dari spam log request
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level error