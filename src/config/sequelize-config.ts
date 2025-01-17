import { Sequelize } from 'sequelize-typescript';
import { Task } from '@/models/Task';

const sequelize = new Sequelize({
  database: 'task_manager_db',
  dialect: 'mysql',
  username: 'root',
  password: '',
  host: '127.0.0.1',
  models: [Task],
  logging: console.log
});

export default sequelize;