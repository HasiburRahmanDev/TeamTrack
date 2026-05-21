import { Pool } from "pg";

import config from "../config";
// export const sql = neon(config.database_url);

export const pool = new Pool({ connectionString: config.database_url });

export const initDB = async () => {
  try {
    await pool.query(`
  CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(75) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'contributor',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
 `);
    await pool.query(`
  CREATE TABLE IF NOT EXISTS issues(
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL, 
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, 
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
 `);
  } catch (error) {}

  console.log("Database connected successfully");
};
