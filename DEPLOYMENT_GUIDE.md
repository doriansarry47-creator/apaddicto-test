# Guide de Déploiement Vercel - Apaddicto

## 🚀 Déploiement rapide avec le code Vercel

Vous avez le code Vercel : `wQIOawWSweqWark0ZL4eI9jU`

### Option 1 : Déploiement via CLI (Recommandé)

1. **Installer Vercel CLI** (si pas déjà fait) :
   ```bash
   npm install -g vercel
   ```

2. **Se connecter à Vercel** :
   ```bash
   vercel login
   ```
   Suivez les instructions pour vous connecter avec votre compte.

3. **Déployer l'application** :
   ```bash
   cd Apaddicto
   vercel --token wQIOawWSweqWark0ZL4eI9jU
   ```

4. **Configurer les variables d'environnement** :
   Quand Vercel vous demande, ajoutez :
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   SESSION_SECRET=Apaddicto2024SecretKey
   ```

### Option 2 : Déploiement via Interface Web

1. **Aller sur Vercel** : https://vercel.com
2. **Se connecter** avec votre compte
3. **Nouveau projet** : Cliquez sur "New Project"
4. **Importer** : Uploadez le dossier Apaddicto ou connectez votre repo Git
5. **Variables d'environnement** : Ajoutez dans les settings :
   - `DATABASE_URL` : `postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `SESSION_SECRET` : `Apaddicto2024SecretKey`
6. **Déployer** : Cliquez sur "Deploy"

## 📋 Checklist post-déploiement

### ✅ Vérifications essentielles

1. **Application accessible** : L'URL Vercel fonctionne
2. **Page de connexion** : `/login` s'affiche correctement
3. **Inscription** : Créer un compte fonctionne
4. **Base de données** : Les données sont sauvegardées

### 🔧 Configuration initiale

1. **Créer un compte admin** :
   - Aller sur votre application déployée
   - S'inscrire avec un email admin
   - Modifier le rôle en base si nécessaire

2. **Initialiser les données** :
   - Se connecter en tant qu'admin
   - Les exercices et contenus sont déjà inclus

3. **Tester les fonctionnalités** :
   - Connexion/déconnexion
   - Création d'exercices (admin)
   - Suivi des progrès (patient)

## 🔗 URLs importantes

- **Application** : [URL fournie par Vercel]
- **Instagram** : https://instagram.com/apaperigueux
- **Base de données** : Neon PostgreSQL (configurée)

## 🆘 Résolution de problèmes

### Erreur de base de données
- Vérifier que `DATABASE_URL` est correctement configurée
- Tester la connexion à la base Neon

### Erreur de build
- Vérifier que toutes les dépendances sont installées
- Contrôler les logs de build Vercel

### Erreur d'authentification
- Vérifier que `SESSION_SECRET` est définie
- Contrôler les cookies dans le navigateur

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel
2. Testez en local avec `npm run dev`
3. Contactez le support technique

## 🎯 Prochaines étapes

1. **Personnalisation** : Modifier les couleurs, logos selon vos besoins
2. **Contenu** : Ajouter plus d'exercices et d'articles
3. **Utilisateurs** : Inviter vos premiers patients
4. **Monitoring** : Configurer les alertes Vercel

---

**Votre application Apaddicto est prête ! 🎉**

