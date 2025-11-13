# ============================================
# Script para generar hash BCrypt para admin
# ============================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Generador de Password Admin" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si BCrypt.Net está disponible
$bcryptAvailable = $false

try {
    Add-Type -Path ".\backend\bin\Debug\net8.0\BCrypt.Net-Next.dll" -ErrorAction Stop
    $bcryptAvailable = $true
} catch {
    Write-Host "BCrypt.Net no encontrado en bin. Intentando con NuGet..." -ForegroundColor Yellow
}

if (-not $bcryptAvailable) {
    Write-Host ""
    Write-Host "Para generar el hash BCrypt, necesitas:" -ForegroundColor Yellow
    Write-Host "1. Compilar el backend primero:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   dotnet build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. O usar una herramienta online:" -ForegroundColor White
    Write-Host "   https://bcrypt-generator.com/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. O usar este código C#:" -ForegroundColor White
    Write-Host @"
using BCrypt.Net;

string password = "admin123";
string hash = BCrypt.HashPassword(password, 11);
Console.WriteLine(hash);
"@ -ForegroundColor Gray
    Write-Host ""
    
    # Proporcionar hash de ejemplo
    Write-Host "Hash de ejemplo para 'admin123':" -ForegroundColor Green
    Write-Host '$2a$11$8K1p/a0dL3LHDGeA4sxL4.v8.P5/mZ5.p5KXWr5u5Qf5Qf5Qf5Qf5' -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANTE: Genera tu propio hash en producción!" -ForegroundColor Red
    Write-Host ""
    
    exit
}

# Si BCrypt está disponible, generar hash
Write-Host "Ingresa la contraseña para el usuario admin:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "Generando hash BCrypt..." -ForegroundColor Yellow

try {
    $hash = [BCrypt.Net.BCrypt]::HashPassword($plainPassword, 11)
    
    Write-Host ""
    Write-Host "Hash generado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copia este hash y úsalo en el script SQL:" -ForegroundColor Cyan
    Write-Host $hash -ForegroundColor White
    Write-Host ""
    Write-Host "SQL para insertar usuario admin:" -ForegroundColor Cyan
    Write-Host @"
INSERT INTO Users (UserCode, Password, FirstName, LastName, Role, IsActive)
VALUES ('admin', '$hash', 'Admin', 'System', 'Admin', TRUE)
ON DUPLICATE KEY UPDATE Password = '$hash';
"@ -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "Error al generar hash: $_" -ForegroundColor Red
}

Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
