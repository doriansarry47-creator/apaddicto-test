import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
user: "postgres",
password: "postgres",
database: "apaddcito",
host: "localhost",
port: 5432,

});

async function reset() {
  try {
    await pool.query(`DROP TABLE IF EXISTS beck_analyses CASCADE;`);
    console.log("Table 'beck_analyses' supprimée avec succès !");
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
  } finally {
    await pool.end();
  }
}

reset();
