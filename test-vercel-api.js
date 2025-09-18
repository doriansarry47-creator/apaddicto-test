// test-vercel-api.js - Test rapide de l'API Vercel
import('./api/index.ts').then((module) => {
  console.log('✅ API Vercel importée avec succès');
  console.log('Module:', module.default ? 'Express app exportée' : 'Pas d\'app Express');
}).catch((error) => {
  console.error('❌ Erreur lors de l\'import de l\'API Vercel:', error);
});