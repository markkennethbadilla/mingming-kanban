import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// For production (Railway), use absolute /data path
// For development, use local path within project
const dataDir = isProduction
  ? '/data'
  : path.join(__dirname, '..', '..', 'data');

// Ensure data directory exists (only for local development)
if (!isProduction && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbStorage =
  process.env.DB_STORAGE || path.join(dataDir, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbStorage,
  logging: false, // Set to console.log to see SQL queries
});

export default sequelize;
