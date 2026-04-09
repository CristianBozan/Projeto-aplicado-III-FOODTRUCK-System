const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sincronizacao = sequelize.define("Sincronizacao", {
  id_sync:      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  data_hora:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status:       { type: DataTypes.STRING(20) },
  id_atendente: { type: DataTypes.INTEGER, allowNull: false },
  id_pedido:    { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: "sincronizacoes",
  timestamps: false
});

module.exports = Sincronizacao;
