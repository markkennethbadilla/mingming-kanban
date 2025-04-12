/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// For production (Railway), use absolute /data path
// For development, use local path within project
const dataDir = isProduction ? '/data' : path.join(__dirname, 'data');

// Ensure data directory exists (only for local development)
if (!isProduction && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// DB storage path based on environment
const dbStorage =
  process.env.DB_STORAGE || path.join(dataDir, 'database.sqlite');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: dbStorage,
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage: dbStorage,
    logging: false,
  },
};
