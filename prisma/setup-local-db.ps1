$env:DATABASE_URL = "file:./prisma/dev.db"

Write-Host "Setting up database..." -ForegroundColor Cyan

npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { Write-Host "Migration failed" -ForegroundColor Red; exit 1 }

npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "Prisma generate failed" -ForegroundColor Red; exit 1 }

node prisma/seed.js
if ($LASTEXITCODE -ne 0) { Write-Host "Seed failed" -ForegroundColor Red; exit 1 }

node prisma/import-statement-mar-apr-2026.js
if ($LASTEXITCODE -ne 0) { Write-Host "Import 1 failed" -ForegroundColor Red; exit 1 }

node prisma/import-statement-apr27-may20-2026.js
if ($LASTEXITCODE -ne 0) { Write-Host "Import 2 failed" -ForegroundColor Red; exit 1 }

node prisma/fix-amazon-date.js
if ($LASTEXITCODE -ne 0) { Write-Host "Date fix failed" -ForegroundColor Red; exit 1 }

node prisma/import-statement-may20-may21-2026.js
if ($LASTEXITCODE -ne 0) { Write-Host "Import 3 failed" -ForegroundColor Red; exit 1 }

node prisma/setup-accounts.js
if ($LASTEXITCODE -ne 0) { Write-Host "Account setup failed" -ForegroundColor Red; exit 1 }

Write-Host "Done! Database is ready." -ForegroundColor Green
