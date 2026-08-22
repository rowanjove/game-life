@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title game-life

echo.
echo  ========================================
echo    game-life / 轮盘人生
echo  ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org/
  echo Enable "Add to PATH", then run again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Reinstall Node.js.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERROR] package.json missing. Run this from the project root.
  pause
  exit /b 1
)

if not exist "node_modules\vite\package.json" (
  echo [INFO] First launch: npm install...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

set "PORT=5173"
set "URL=http://127.0.0.1:%PORT%/"

echo Starting %URL%
echo Close this window to stop the server.
echo ----------------------------------------

if /i not "%GAME_LIFE_NO_BROWSER%"=="1" (
  if exist "%~dp0scripts\open-when-ready.ps1" (
    start "game-life-browser" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\open-when-ready.ps1" -Url "%URL%"
  )
)

call npm run dev -- --host 127.0.0.1 --port %PORT% --strictPort
set "EXITCODE=%ERRORLEVEL%"
if not "%EXITCODE%"=="0" (
  echo [ERROR] Server failed (code %EXITCODE%). Port %PORT% may be in use.
  pause
)
endlocal
exit /b %EXITCODE%
