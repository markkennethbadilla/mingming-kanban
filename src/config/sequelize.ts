import { Sequelize } from 'sequelize';
import { Dialect } from 'sequelize';
import config from './sequelize-config';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize({
  dialect: dbConfig.dialect as Dialect,
  host: dbConfig.host,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
});



export default sequelize;