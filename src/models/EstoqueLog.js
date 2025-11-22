const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EstoqueLog = sequelize.define('EstoqueLog', {
  id_estoque_log: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_produto: { type: DataTypes.INTEGER, allowNull: false },
  acao: { type: DataTypes.ENUM('create','update','delete'), allowNull: false },
  quantidade_anterior: { type: DataTypes.INTEGER },
  quantidade_nova: { type: DataTypes.INTEGER },
  nota: { type: DataTypes.TEXT },
  data_hora: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'estoque_logs',
  timestamps: false
});

module.exports = EstoqueLog;
