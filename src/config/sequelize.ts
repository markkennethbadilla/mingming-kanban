import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Load the TLS certificate if available
const sslOptions = process.env.DB_SSL
  ? {
      require: true,
      ca: process.env.DB_SSL_CERT,
    }
  : undefined;

const sequelize = new Sequelize(
  process.env.DB_DATABASE as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    dialectModule: (await import('pg')).default,
    dialectOptions: {
      ssl: sslOptions,
    },
  }
);

export default sequelize;
