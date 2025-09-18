import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { users } from "./shared/schema.js";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const sqlite = new Database("database.db");
const db = drizzle(sqlite);

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = {
    id: randomUUID(),
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    password: hashedPassword,
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null
  };

  try {
    await db.insert(users).values(admin);
    console.log("Admin créé avec succès:", admin.email);
  } catch (error) {
    console.log("Erreur lors de la création de l'admin:", error.message);
  }
}

createAdmin();
