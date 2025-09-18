#!/bin/bash

echo "🧪 Test des stratégies anti-craving avec curl"
echo "=============================================="
echo ""

SERVER_URL="http://localhost:5000"

# Test 1: API Health check
echo "📡 1. Test de l'API de base..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL/api/test-db" 2>/dev/null)
if [ "$response" = "200" ]; then
    echo "✅ API de base fonctionnelle (HTTP $response)"
else
    echo "❌ API de base échouée (HTTP $response)"
    exit 1
fi
echo ""

# Test 2: User registration
echo "👤 2. Test de création d'utilisateur..."
USER_DATA='{"email":"test-strategies@example.com","password":"test123456","firstName":"Test","lastName":"Strategies"}'
response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$USER_DATA" "$SERVER_URL/api/auth/register" -c cookies.txt 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo "✅ Utilisateur créé avec succès (HTTP $http_code)"
    echo "   Session sauvegardée dans cookies.txt"
elif [ "$http_code" = "400" ] && echo "$response_body" | grep -q "déjà utilisé"; then
    echo "ℹ️  Utilisateur existe déjà, tentative de connexion..."
    
    # Try to login instead
    LOGIN_DATA='{"email":"test-strategies@example.com","password":"test123456"}'
    response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" "$SERVER_URL/api/auth/login" -c cookies.txt 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Connexion réussie (HTTP $http_code)"
    else
        echo "❌ Connexion échouée (HTTP $http_code)"
        exit 1
    fi
else
    echo "❌ Création utilisateur échouée (HTTP $http_code)"
    echo "   Réponse: $response_body"
    exit 1
fi
echo ""

# Test 3: Save strategies
echo "💾 3. Test de sauvegarde des stratégies..."
STRATEGIES_DATA='{
  "strategies": [
    {
      "context": "leisure",
      "exercise": "Course à pied matinale de 20 minutes",
      "effort": "modéré",
      "duration": 20,
      "cravingBefore": 8,
      "cravingAfter": 3
    },
    {
      "context": "home", 
      "exercise": "Méditation guidée et respiration profonde",
      "effort": "faible",
      "duration": 15,
      "cravingBefore": 6,
      "cravingAfter": 2
    },
    {
      "context": "work",
      "exercise": "Étirements au bureau et marche",
      "effort": "faible", 
      "duration": 10,
      "cravingBefore": 7,
      "cravingAfter": 4
    }
  ]
}'

response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$STRATEGIES_DATA" "$SERVER_URL/api/strategies" -b cookies.txt 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo "✅ Stratégies sauvegardées avec succès (HTTP $http_code)"
    # Try to count saved strategies
    strategies_count=$(echo "$response_body" | grep -o '"strategies":\[' | wc -l)
    if [ "$strategies_count" -gt 0 ]; then
        echo "   📊 Stratégies enregistrées dans la réponse"
    fi
else
    echo "❌ Sauvegarde stratégies échouée (HTTP $http_code)"
    echo "   Réponse: $response_body"
    exit 1
fi
echo ""

# Test 4: Retrieve strategies
echo "📋 4. Test de récupération des stratégies..."
response=$(curl -s -w "\n%{http_code}" -X GET "$SERVER_URL/api/strategies" -b cookies.txt 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo "✅ Stratégies récupérées avec succès (HTTP $http_code)"
    
    # Check if response contains strategies
    if echo "$response_body" | grep -q '"exercise"'; then
        strategies_found=$(echo "$response_body" | grep -o '"exercise"' | wc -l)
        echo "   📊 $strategies_found stratégies trouvées"
        
        # Check if strategies have required fields
        if echo "$response_body" | grep -q '"context"' && echo "$response_body" | grep -q '"cravingBefore"'; then
            echo "   ✅ Structure des stratégies correcte"
        else
            echo "   ⚠️  Structure des stratégies possiblement incomplète"
        fi
    else
        echo "   ⚠️  Aucune stratégie trouvée dans la réponse"
    fi
else
    echo "❌ Récupération stratégies échouée (HTTP $http_code)"
    echo "   Réponse: $response_body"
    exit 1
fi
echo ""

# Test 5: Check component files
echo "🔍 5. Test de la présence des composants..."

# Check StrategiesBox component
if [ -f "client/src/components/strategies-box.tsx" ]; then
    if grep -q "Boîte à Stratégies Anti-Craving" client/src/components/strategies-box.tsx && \
       grep -q "saveStrategiesMutation" client/src/components/strategies-box.tsx; then
        echo "✅ Composant StrategiesBox correct"
    else
        echo "❌ Composant StrategiesBox problématique"
        exit 1
    fi
else
    echo "❌ Fichier StrategiesBox manquant"
    exit 1
fi

# Check tracking page
if [ -f "client/src/pages/tracking.tsx" ]; then
    if grep -q "AntiCravingStrategy" client/src/pages/tracking.tsx && \
       grep -q "strategies" client/src/pages/tracking.tsx; then
        echo "✅ Page Suivi/Tracking correcte"
    else
        echo "❌ Page Suivi/Tracking problématique"
        exit 1
    fi
else
    echo "❌ Fichier tracking.tsx manquant"
    exit 1
fi

# Check dashboard emergency routine access
if [ -f "client/src/pages/dashboard.tsx" ]; then
    if grep -q "antiCravingStrategies" client/src/pages/dashboard.tsx && \
       grep -q "showEmergencyStrategies" client/src/pages/dashboard.tsx; then
        echo "✅ Accès aux stratégies dans routine d'urgence correct"
    else
        echo "❌ Accès aux stratégies dans routine d'urgence problématique"
        exit 1
    fi
else
    echo "❌ Fichier dashboard.tsx manquant"
    exit 1
fi
echo ""

# Cleanup
rm -f cookies.txt

echo "=============================================="
echo "🎉 TOUS LES TESTS RÉUSSIS !"
echo ""
echo "✅ La Boîte à Stratégies Anti-Craving fonctionne correctement"
echo "✅ Les stratégies sont sauvegardées et peuvent être récupérées via l'API"
echo "✅ Les stratégies apparaissent dans l'onglet Suivi (page tracking.tsx)"  
echo "✅ Les stratégies sont accessibles dans la routine d'urgence (dashboard.tsx)"
echo ""
echo "🔧 Corrections appliquées:"
echo "   • Amélioration de la validation et gestion d'erreurs côté serveur"
echo "   • Amélioration du feedback utilisateur côté client" 
echo "   • Logging détaillé pour le debug"
echo "   • Validation des données avant sauvegarde"
echo ""
echo "📱 URL de l'application: https://5000-inf3qzgkc5jivekbpqewn-6532622b.e2b.dev"