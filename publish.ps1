# publish.ps1
param(
    [string]$Message = "auto update"
)

Write-Host "🔄 Ajout des fichiers modifiés..."
git add .

Write-Host "✅ Commit avec message : $Message"
git commit -m "$Message"

Write-Host "🚀 Push vers GitHub..."
git push

Write-Host "🎉 Déploiement envoyé sur GitHub (et Vercel redéclenché si lié)"
