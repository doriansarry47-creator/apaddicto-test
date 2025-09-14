#!/bin/bash

echo "🧪 TEST POST-CORRECTION DES STRATÉGIES"
echo "======================================"

echo "📋 Instructions de test manuel:"
echo "1. Démarrez l'application avec: npm run dev"
echo "2. Ouvrez http://localhost:5173"
echo "3. Connectez-vous avec demo@example.com / demo123"
echo "4. Testez la Boîte à Stratégies Anti-Craving"
echo ""
echo "🔍 Points à vérifier:"
echo "- La sauvegarde fonctionne sans erreur"
echo "- Les stratégies apparaissent dans l'onglet Suivi"
echo "- Les stratégies sont accessibles dans la Routine d'Urgence"
echo ""
echo "📊 Vérification de l'état de l'application..."

# Vérifier que tous les fichiers sont présents
if [ ! -f "client/src/components/strategies-box.tsx" ]; then
    echo "❌ Composant strategies-box.tsx manquant"
    exit 1
fi

if [ ! -f "client/src/pages/dashboard.tsx" ]; then
    echo "❌ Page dashboard.tsx manquante"
    exit 1
fi

if [ ! -f "client/src/pages/tracking.tsx" ]; then
    echo "❌ Page tracking.tsx manquante"
    exit 1
fi

if [ ! -f "server/routes.ts" ]; then
    echo "❌ Fichier routes.ts manquant"
    exit 1
fi

echo "✅ Tous les fichiers principaux sont présents"

# Vérifier les corrections appliquées
echo "🔍 Vérification des corrections..."

# Vérifier les query keys
if grep -q 'queryKey.*strategies.*authenticatedUser' client/src/pages/dashboard.tsx; then
    echo "❌ Query key inconsistante détectée dans dashboard.tsx"
    echo "🔧 Correction: Utilisez queryKey: ['/api/strategies'] uniquement"
else
    echo "✅ Query keys cohérentes"
fi

# Vérifier l'API
if grep -q 'POST.*api/strategies' server/routes.ts; then
    echo "✅ Route API strategies présente"
else
    echo "❌ Route API strategies manquante"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "1. npm install (si pas déjà fait)"
echo "2. npm run dev"
echo "3. Test manuel de la fonctionnalité"

echo ""
echo "🆘 En cas de problème persistant:"
echo "- Vérifiez la console du navigateur pour les erreurs"
echo "- Vérifiez les logs du serveur"
echo "- Vérifiez la base de données"
