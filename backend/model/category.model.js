import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const category = sequelize.define('Category', {
  categoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoryType: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'categories',
  timestamps: false,
});

export default category;
