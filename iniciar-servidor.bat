@echo off
echo ========================================
echo   Servidor Local - Mapa ESRN Rural
echo ========================================
echo.
echo Iniciando servidor local...
echo.
echo Acceda al mapa en: http://localhost:8000
echo.
echo Presione Ctrl+C para detener el servidor
echo.
cd /d "%~dp0"
python -m http.server 8000
