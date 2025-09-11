# Guide de Déploiement Vercel - Apaddicto

## 🚀 Déploiement sur Vercel

### Étape 1: Prérequis
- Compte Vercel (https://vercel.com)
- Repository GitHub avec le code de l'application
- Base de données PostgreSQL (Neon) configurée

### Étape 2: Variables d'environnement Vercel

Dans les paramètres de votre projet Vercel, ajoutez ces variables d'environnement :

```bash
DATABASE_URL=postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=Apaddicto2024SecretKey
NODE_ENV=production
CORS_ORIGIN=https://votre-domaine-vercel.vercel.app
```

### Étape 3: Configuration du build

Vercel détectera automatiquement :
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Étape 4: Configuration DNS (Optionnel)

Si vous souhaitez utiliser un domaine personnalisé:
1. Ajoutez votre domaine dans les paramètres Vercel
2. Configurez les enregistrements DNS chez votre registrar
3. Mettez à jour la variable `CORS_ORIGIN` avec votre nouveau domaine

### Étape 5: Déploiement

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez !

### 🔧 Fonctionnalités de l'Application

- **Page d'accueil personnalisée** avec message de bienvenue
- **Page profil complète** avec :
  - Visualisation des informations du compte
  - Modification des données personnelles
  - Changement de mot de passe
  - Suppression de compte avec confirmation
  - Statistiques détaillées et badges
- **Authentification sécurisée**
- **Base de données PostgreSQL** avec migrations automatiques
- **Interface responsive** compatible mobile et desktop

### 🎯 URLs importantes après déploiement

- **Application**: `https://votre-app.vercel.app`
- **API Health Check**: `https://votre-app.vercel.app/api/health`
- **Page de connexion**: `https://votre-app.vercel.app/login`

### ⚡ Test rapide après déploiement

1. Accédez à votre URL Vercel
2. Créez un compte utilisateur
3. Explorez la page d'accueil personnalisée
4. Vérifiez votre page profil
5. Testez les fonctionnalités principales

### 📞 Support

En cas de problème :
1. Vérifiez les logs Vercel
2. Testez la connexion à la base de données via `/api/health`
3. Vérifiez que toutes les variables d'environnement sont correctement configurées