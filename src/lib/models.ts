import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
  }
);

const db = {
  sequelize,
  Sequelize,
  Task: sequelize.define('Task', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    startTime: { type: DataTypes.DATE },
    endTime: { type: DataTypes.DATE },
    priority: { type: DataTypes.INTEGER, defaultValue: 1 },
  }),
};

export default db;
