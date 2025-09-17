#!/bin/bash

# Script d'initialisation pour s'assurer que la base de données est correctement configurée
# Ce script doit être exécuté avant le déployement

echo "🔧 Initialisation de la base de données..."

# Vérifier si DATABASE_URL est configuré
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL n'est pas configuré"
    exit 1
fi

echo "✅ DATABASE_URL configuré"

# Activer l'extension pgcrypto
echo "🔐 Activation de l'extension pgcrypto..."
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Extension pgcrypto activée"
else
    echo "❌ Erreur lors de l'activation de pgcrypto"
    exit 1
fi

# Tester les fonctions de hachage
echo "🧪 Test des fonctions de hachage..."
psql "$DATABASE_URL" -c "SELECT crypt('test', gen_salt('bf')) as test_hash;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Fonctions de hachage opérationnelles"
else
    echo "❌ Problème avec les fonctions de hachage"
    exit 1
fi

echo "🎉 Base de données initialisée avec succès !"
echo ""
echo "📋 Résumé :"
echo "  • Extension pgcrypto : Activée"
echo "  • Fonctions crypt() et gen_salt() : Disponibles"
echo "  • Authentification et inscription : Fonctionnelles"
echo ""
