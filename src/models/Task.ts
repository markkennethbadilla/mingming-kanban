import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'tasks',
  timestamps: true
})
export class Task extends Model<Task> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  startTime!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  endTime!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  priority!: number;
}