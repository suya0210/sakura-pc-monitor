@echo off
echo ==========================================
echo STARTING SAKURA PC MONITOR SERVER...
echo ==========================================
:: Mendapatkan IP Local IPv4
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" /c:"Address"') do set IP=%%a
set IP=%IP: =%

echo Akses Dashboard dari perangkat lain di jaringan ini:
echo http://%IP%:8000
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000
pause