import { Router } from 'express';
import pkg from 'pg';

const { Pool } = pkg;
export const debugTablesRouter = Router();

function ensureDbUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL manquant');
  return url;
}
function makePool() {
  return new Pool({ connectionString: ensureDbUrl() });
}

// GET /api/debug/tables
debugTablesRouter.get('/debug/tables', async (_req, res) => {
  const pool = makePool();
  try {
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json({ tables: tables.rows.map((r: any) => r.table_name) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool.end();
  }
});

// GET /api/debug/tables/counts
debugTablesRouter.get('/debug/tables/counts', async (_req, res) => {
  const pool = makePool();
  try {
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const out: Record<string, number> = {};
    for (const row of tables.rows) {
      const tableName = row.table_name;
      const count = await pool.query(`SELECT COUNT(*)::int AS c FROM "${tableName}";`);
      out[tableName] = count.rows[0].c;
    }
    res.json(out);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool.end();
  }
});

// DELETE /api/debug/tables/purge
debugTablesRouter.delete('/debug/tables/purge', async (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Purge interdite en production' });
  }
  const pool = makePool();
  try {
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type='BASE TABLE'
      ORDER BY table_name;
    `);
    for (const row of tables.rows) {
      const tableName = row.table_name;
      await pool.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool.end();
  }
});
