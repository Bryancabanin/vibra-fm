import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Edge case
if (!process.env.DATABASE_URI) {
  throw new Error('Database URI variable is not set.');
}

// Make the connection to our database.
const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
});

const closePool = () => pool.end();

export { pool, closePool };
