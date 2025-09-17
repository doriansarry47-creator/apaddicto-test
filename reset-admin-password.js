#!/usr/bin/env node

import 'dotenv/config';
import { getDB } from './server/db.ts';
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'doriansarry@yahoo.fr';
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
  console.log('🔧 Réinitialisation du mot de passe admin...');
  
  try {
    const db = getDB();
    
    // Vérifier si l'utilisateur existe
    const existingUsers = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));
    
    if (existingUsers.length === 0) {
      console.log('❌ Aucun utilisateur trouvé avec cet email:', ADMIN_EMAIL);
      
      // Créer l'utilisateur admin
      console.log('📝 Création de l\'utilisateur admin...');
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
      
      const newUser = await db.insert(users).values({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: 'Dorian',
        lastName: 'Sarry',
        role: 'admin',
        isActive: true
      }).returning();
      
      console.log('✅ Utilisateur admin créé:', newUser[0].email, 'Role:', newUser[0].role);
      return;
    }
    
    const user = existingUsers[0];
    console.log('👤 Utilisateur trouvé:', user.email, 'Role:', user.role);
    
    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    
    // Mettre à jour le mot de passe et s'assurer que le rôle est admin
    await db.update(users)
      .set({ 
        password: hashedPassword,
        role: 'admin',
        isActive: true
      })
      .where(eq(users.email, ADMIN_EMAIL));
    
    console.log('✅ Mot de passe réinitialisé avec succès pour:', ADMIN_EMAIL);
    console.log('🔑 Nouveau mot de passe:', NEW_PASSWORD);
    
    // Vérifier la mise à jour
    const updatedUsers = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));
    const updatedUser = updatedUsers[0];
    console.log('✅ Vérification - Role:', updatedUser.role, 'Active:', updatedUser.isActive);
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
  }
}

resetAdminPassword().catch(console.error);