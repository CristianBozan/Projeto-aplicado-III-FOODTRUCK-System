const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Mesa = sequelize.define("Mesa", {
  id_mesa: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  numero_mesa: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("livre", "ocupada"), defaultValue: "livre" }
}, {
  tableName: "mesas",
  timestamps: false
});

module.exports = Mesa;
