import { Model, DataTypes, Sequelize } from 'sequelize';
class Task extends Model {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public dueDate!: Date;
  public priority!: 'LOW' | 'MEDIUM' | 'HIGH';
  public status!: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): void {
    Task.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        dueDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        priority: {
          type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('TO_DO', 'IN_PROGRESS', 'DONE'),
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Task',
        tableName: 'Tasks',
        timestamps: true,
      }
    );
  }
}
export default Task;
