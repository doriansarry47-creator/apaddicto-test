# Déploiement sur Vercel - Guide Complet 🚀

## ✅ Corrections apportées

### Problème résolu : Erreur DATABASE_URL
- **Problème** : `Error: DATABASE_URL must be set. Did you forget to provision a database?`
- **Solution** : Implémentation du lazy loading pour les connexions de base de données
- **Fichiers modifiés** : `server/db.ts`, `api/index.ts`, `vercel.json`

## Configuration requise

### Variables d'environnement Vercel

⚠️ **IMPORTANT** : Configurez ces variables dans les paramètres de votre projet Vercel (Dashboard > Projet > Settings > Environment Variables) :

```bash
DATABASE_URL=postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=Apaddicto2024SecretKey
NODE_ENV=production
```

### Commandes de build

Le projet utilise le script `vercel-build` défini dans package.json :

```bash
npm run vercel-build
```

Ceci exécute :
1. `npm run build:client` - Build le frontend React avec Vite
2. `npm run build:server` - Build le serveur Express avec esbuild

## Architecture

### Frontend (Client)
- **Framework** : React + TypeScript + Vite
- **UI** : Tailwind CSS + Shadcn/UI
- **Routing** : Wouter
- **State Management** : React Query
- **Build Output** : `dist/public/`

### Backend (Serveur)
- **Framework** : Express + TypeScript
- **Base de données** : PostgreSQL (Neon) avec Drizzle ORM
- **Authentification** : Sessions avec bcrypt
- **Build Output** : `dist/server/index.js`

### Base de données
- **Provider** : Neon PostgreSQL
- **ORM** : Drizzle
- **Migrations** : Gérées via Drizzle Kit

## Structure des fichiers

```
/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks React personnalisés
│   │   └── lib/            # Utilitaires et configuration
│   └── index.html          # Template HTML principal
├── server/                 # Backend Express
│   ├── index.ts           # Point d'entrée principal
│   ├── routes.ts          # Routes API
│   ├── auth.ts            # Système d'authentification
│   ├── storage.ts         # Couche d'accès aux données
│   ├── db.ts             # Configuration base de données
│   └── env.ts            # Configuration variables d'environnement
├── shared/                # Types et schémas partagés
│   └── schema.ts          # Schémas Drizzle et types TypeScript
├── dist/                  # Fichiers de build (généré)
│   ├── public/            # Frontend statique
│   └── server/            # Serveur bundlé
└── vercel.json           # Configuration Vercel
```

## Processus de déploiement

### 1. Préparation locale

```bash
# Vérifier que tout compile
npm run build

# Tester en local (optionnel)
npm run start
```

### 2. Configuration Vercel

1. Connectez votre repository GitHub à Vercel
2. Ajoutez les variables d'environnement dans les paramètres Vercel
3. Vercel détectera automatiquement la configuration via `vercel.json`

### 3. Déploiement automatique

Vercel déploiera automatiquement à chaque push sur la branche principale.

### 4. Post-déploiement

Après le premier déploiement :

1. **Initialiser la base de données** (si nécessaire) :
   - Accédez à `https://votre-app.vercel.app/api/test-db` pour vérifier la connexion
   - Les tables sont créées automatiquement au premier démarrage

2. **Créer un utilisateur administrateur** :
   ```bash
   curl -X POST "https://votre-app.vercel.app/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@apaddicto.com","password":"votremotdepasse","firstName":"Admin","lastName":"Système","role":"admin"}'
   ```

3. **Initialiser les données d'exemple** :
   - Connectez-vous en tant qu'admin
   - Accédez à `https://votre-app.vercel.app/api/seed-data` (POST request avec session admin)

## URLs de l'application

### Frontend
- **Page d'accueil** : `https://votre-app.vercel.app/`
- **Connexion** : `https://votre-app.vercel.app/login`
- **Dashboard** : `https://votre-app.vercel.app/` (après connexion)

### API Endpoints
- **Test DB** : `GET /api/test-db`
- **Authentification** : `/api/auth/*`
- **Exercices** : `GET /api/exercises`
- **Contenu psychoéducatif** : `GET /api/psycho-education`
- **Admin** : `/api/admin/*` (nécessite rôle admin)

## Fonctionnalités principales

### Pour les patients
- ✅ Inscription et connexion sécurisées
- ✅ Catalogue d'exercices de thérapie sportive
- ✅ Contenu psychoéducatif personnalisé
- ✅ Suivi des envies et des sessions d'exercice
- ✅ Analyses cognitives (méthode Beck)
- ✅ Système de badges et de progression

### Pour les administrateurs
- ✅ Gestion des exercices
- ✅ Gestion du contenu psychoéducatif
- ✅ Initialisation des données d'exemple
- ✅ Accès aux fonctionnalités administratives

## 🧪 Test du déploiement

### Script de test automatique

Utilisez le script fourni pour tester votre déploiement :

```bash
# Tester l'application locale
node test-deployment.js http://localhost:3000

# Tester l'application déployée sur Vercel
node test-deployment.js https://votre-app.vercel.app
```

### Tests manuels

1. **Page d'accueil** : `https://votre-app.vercel.app/`
2. **Test base de données** : `https://votre-app.vercel.app/api/test-db`
3. **API Exercices** : `https://votre-app.vercel.app/api/exercises`
4. **API Contenu** : `https://votre-app.vercel.app/api/psycho-education`

## Résolution de problèmes

### ❌ Erreur DATABASE_URL (RÉSOLU)
**Problème** : `DATABASE_URL must be set. Did you forget to provision a database?`
**Solution** : ✅ Correction implémentée avec lazy loading des connexions

### Build échoue
- Vérifiez que toutes les dépendances sont installées
- Assurez-vous que TypeScript compile sans erreurs
- Exécutez `npm run vercel-build` localement pour tester

### Problème de base de données
- Vérifiez que `DATABASE_URL` est correctement configurée dans Vercel
- Testez la connexion avec `/api/test-db`
- Vérifiez les logs Vercel pour les erreurs de connexion

### Problèmes d'authentification
- Vérifiez que `SESSION_SECRET` est définie dans Vercel
- Les sessions utilisent maintenant une configuration sécurisée pour HTTPS
- Les cookies sont configurés avec `sameSite: 'lax'` pour la sécurité CSRF

### Variables d'environnement non détectées
- Assurez-vous que les variables sont configurées dans l'onglet "Environment Variables" de Vercel
- Redéployez après avoir ajouté/modifié les variables d'environnement
- Vérifiez que `NODE_ENV=production` est bien défini

### Redirection après connexion
- Le frontend utilise React Query pour gérer l'état d'authentification
- Les redirections sont automatiques après une connexion réussie
- Vérifiez la console du navigateur pour les erreurs JavaScript

## 🚀 Déploiement automatique

### GitHub Integration
1. Connectez votre repository GitHub à Vercel
2. Vercel déploiera automatiquement à chaque push sur `main`
3. Les builds sont automatiquement déclenchés avec `npm run vercel-build`

### Pre-deployment checklist
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Code committé et pushé sur GitHub
- [ ] Build local réussi avec `npm run vercel-build`
- [ ] Tests locaux passés

## Support

Pour toute question ou problème :

1. **Logs Vercel** : Vérifiez les logs dans le dashboard Vercel
2. **Test des endpoints** : Utilisez le script `test-deployment.js`
3. **Variables d'environnement** : Vérifiez qu'elles sont bien configurées
4. **Base de données** : Consultez la documentation Neon pour les problèmes de connexion
5. **Build local** : Testez `npm run vercel-build` avant de déployer

### Liens utiles
- Dashboard Vercel : https://vercel.com/dashboard
- Documentation Neon : https://neon.tech/docs
- Support Vercel : https://vercel.com/support