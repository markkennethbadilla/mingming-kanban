import sequelize from '../config/sequelize'; // Sequelize instance
import User from '@/models/user';
import Task from '@/models/task';

export function initializeModels() {
  User.initModel(sequelize);
  Task.initModel(sequelize);

  User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Task.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
}

initializeModels();
export { sequelize, User, Task };
