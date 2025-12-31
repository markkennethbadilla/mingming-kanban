import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pg = require('pg');

dotenv.config();

const sequelize = new Sequelize(
  (process.env.DB_NAME || process.env.POSTGRES_DATABASE) as string,
  (process.env.DB_USERNAME || process.env.POSTGRES_USER) as string,
  (process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD) as string,
  {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST,
    dialect: 'postgres',
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    dialectModule: pg,
  }
);

// Add this block to sync models with the database
sequelize
  .sync()
  .then(() => {
    console.log('Database & tables synced');
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

export default sequelize;
