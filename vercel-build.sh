#!/bin/bash

# Script de build pour Vercel
# Ce script remplace package.json avec la version optimisée pour Vercel

echo "🔧 Préparation du build Vercel..."

# Sauvegarde du package.json original
cp package.json package.json.backup

# Utilise la version optimisée pour Vercel
cp package.json.vercel package.json

echo "📦 Installation des dépendances..."
npm install --production=false

echo "🏗️ Build de l'application..."
npm run build:client
npm run build:server

echo "✅ Build terminé avec succès!"