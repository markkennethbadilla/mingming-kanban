const fs = require('fs');
const path = require('path');
const config = require('./sequelize-config.json');

module.exports = {
  development: {
    username: config.development.username,
    password: config.development.password,
    database: config.development.database,
    host: config.development.host,
    dialect: config.development.dialect,
    port: parseInt(config.development.port, 10),
    dialectOptions: {
      ssl: {
        require: true,
        ca: fs.readFileSync(path.resolve(__dirname, 'ca.pem')).toString(),
      },
    },
  },
  // Add other environments if needed
};