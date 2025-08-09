import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const appEnv = process.env.APP_ENV || 'development';

let sequelize: Sequelize;

if (appEnv === 'production') {
  sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USERNAME as string,
    process.env.DB_PASSWORD as string,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT as any,
      logging: false,
    }
  );
} else {
  // Development: SQLite
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbStorage =
    process.env.DB_STORAGE || path.join(dataDir, 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbStorage,
    logging: false,
  });
}

export default sequelize;
