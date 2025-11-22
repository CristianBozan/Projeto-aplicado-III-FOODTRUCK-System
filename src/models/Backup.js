const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Backup = sequelize.define('Backup', {
  id_backup: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  conteudo_json: { type: DataTypes.TEXT('long'), allowNull: false },
  data_hora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'backups',
  timestamps: false
});

module.exports = Backup;
