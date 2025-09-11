// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pkg;

let pool: InstanceType<typeof Pool> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Lazy initialization pour éviter les erreurs au build time
export function getDB() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    db = drizzle(pool, { schema });
  }
  
  return db;
}

export function getPool() {
  if (!pool) {
    getDB(); // This will initialize both pool and db
  }
  return pool!;
}

// Pour la compatibilité avec le code existant
export { getDB as db };
export { getPool as pool };
