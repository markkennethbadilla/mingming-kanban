/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Safe import that won't crash if file doesn't exist
let config = {};
try {
  config = require('./sequelize-config.json');
} catch (error) {
  console.log('sequelize-config.json not found, using default config');
}

module.exports = {
  development: {
    dialect: 'sqlite',
    storage:
      process.env.DB_STORAGE || path.resolve(__dirname, 'database.sqlite'),
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage:
      process.env.DB_STORAGE || path.resolve(__dirname, 'database.sqlite'),
    logging: false,
  },
};
