import { Sequelize } from 'sequelize';
import pg from 'pg';
import config from './sequelize-config';

const sequelize = new Sequelize({
  dialect: pg,
  host: config.host,
  username: config.username,
  password: config.password,
  database: config.database,
});

export default sequelize;