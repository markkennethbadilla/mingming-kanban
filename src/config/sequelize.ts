import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage:
    process.env.DB_STORAGE ||
    path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: false, // Set to console.log to see SQL queries
});

export default sequelize;
