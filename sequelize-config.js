/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const appEnv = process.env.APP_ENV || 'development';

const dataDir = path.join(__dirname, 'data');
if (appEnv !== 'production' && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbStorage =
  process.env.DB_STORAGE || path.join(dataDir, 'database.sqlite');

const config = {
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
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
  },
};

module.exports = config[appEnv];
