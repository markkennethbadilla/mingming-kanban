import { Dialect } from 'sequelize';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env.local' });

const getEnvVar = (key: string, allowEmpty: boolean = false): string => {
  const value = process.env[key];
  if (value === undefined || (!allowEmpty && value === '')) {
    throw new Error(`Environment variable ${key} is not defined or is empty`);
  }
  return value;
};

interface SequelizeConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
}

const config: SequelizeConfig = {
  username: getEnvVar('DB_USERNAME'),
  password: getEnvVar('DB_PASSWORD', true), // Allow empty password
  database: getEnvVar('DB_DATABASE'),
  host: getEnvVar('DB_HOST'),
  dialect: getEnvVar('DB_DIALECT') as Dialect,
};

export default config;