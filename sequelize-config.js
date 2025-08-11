/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

const pg = require('pg');

const appEnv = process.env.APP_ENV || 'development';

const sslConfig = {
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  dialectModule: pg,
};

const config = {
  development: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
    ...sslConfig,
  },
  test: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
    ...sslConfig,
  },
  production: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
    ...sslConfig,
  },
};

module.exports = config[appEnv];
