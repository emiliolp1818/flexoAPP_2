@echo off

echo Matando procesos...
taskkill /f /im dotnet.exe 2>nul
taskkill /f /im node.exe 2>nul

echo Iniciando backend...
start cmd /k "cd backend && dotnet run --urls http://0.0.0.0:7003"

timeout 5

echo Iniciando frontend...
start cmd /k "cd Frontend && ng serve --host 0.0.0.0"

timeout 10

echo Abriendo navegador...
start http://localhost:4200

echo Listo! Usuario: admin, Password: admin123
pause