# 🎯 Apaddicto - Application de Thérapie Anti-Addiction

## ✅ Correction du Déploiement

### Problème résolu
- **Ancien problème** : Fichiers obsolètes (`minimal-server.js`) qui interféraient avec l'architecture Vercel
- **Solution** : Nettoyage et configuration correcte pour le déploiement Vercel

## 🏗️ Architecture Actuelle

### Frontend
- **Framework** : React + TypeScript + Vite
- **UI** : Tailwind CSS + Shadcn/UI
- **Routing** : Wouter
- **Build** : `npm run build:client` → `dist/`

### Backend API
- **Platform** : Vercel Serverless Functions
- **Framework** : Express.js dans `/api/server.js`
- **Base de données** : PostgreSQL (Neon)
- **Authentification** : Sessions + bcrypt

### Base de données
- **Provider** : Neon PostgreSQL
- **ORM** : Drizzle
- **Migrations** : Automatiques via `/api/migrate.js`

## 🚀 Déploiement sur Vercel

### Prérequis
1. Compte Vercel connecté au repository GitHub
2. Variables d'environnement configurées dans Vercel

### Variables d'environnement Vercel
```bash
DATABASE_URL=postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=Apaddicto2024SecretKey
NODE_ENV=production
CORS_ORIGIN=*
```

### Déploiement automatique
1. Push vers `main` → Déploiement automatique
2. Build command : `npm run vercel-build`
3. Output directory : `dist`

## 🧪 Test de l'Application

### Option 1 : Test sur Vercel (Recommandé)
1. Accédez à votre URL Vercel déployée
2. Utilisez l'interface principale de l'application

### Option 2 : Test local avec fichier de test
```bash
# Ouvrir le fichier de test dans un navigateur
open test-vercel-auth.html
```

### Fonctionnalités testables
- ✅ Inscription utilisateur
- ✅ Connexion/Déconnexion
- ✅ Sessions persistantes
- ✅ Protection des routes
- ✅ API Health check

## 📋 Endpoints API Disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/profile` - Profil utilisateur

### Système
- `GET /api/health` - Status de l'API
- `GET /api/tables` - Liste des tables DB
- `GET /api/data` - Données de toutes les tables

## 🔧 Développement Local

### Installation
```bash
npm install
```

### Démarrage
```bash
# Frontend (Vite dev server)
npm run client:dev

# Backend (TypeScript server)
npm run dev
```

### Build
```bash
# Build complet
npm run build

# Build pour Vercel
npm run vercel-build
```

## 📚 Structure du Projet

```
/
├── api/                    # Vercel serverless functions
│   ├── index.js           # Handler principal
│   ├── server.js          # Express app
│   └── migrate.js         # Migrations DB
├── client/                # Frontend React
├── server/                # Backend TypeScript (dev)
├── dist/                  # Build output
├── vercel.json           # Configuration Vercel
└── test-vercel-auth.html # Fichier de test
```

## 🎉 Status

✅ **Application déployée et fonctionnelle !**

- Authentification réparée
- Architecture Vercel optimisée
- Base de données connectée
- Tests validés

Pour utiliser l'application : Accédez à votre URL Vercel ou testez localement avec le fichier `test-vercel-auth.html`.

---

**Dernière mise à jour** : Application corrigée et déployée avec succès sur Vercel.
