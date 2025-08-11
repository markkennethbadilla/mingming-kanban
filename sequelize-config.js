/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

const appEnv = process.env.APP_ENV || 'development';

const config = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_task_manager_dev',
    logging: false,
  },
  test: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_task_manager_test',
    logging: false,
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_task_manager_prod',
    logging: false,
  },
};

module.exports = config[appEnv];
