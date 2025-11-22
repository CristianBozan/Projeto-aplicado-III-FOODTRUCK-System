const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Atendente = sequelize.define("Atendente", {
  id_atendente: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING(11), unique: true, allowNull: false },
  telefone: { type: DataTypes.STRING },
  login: { type: DataTypes.STRING, unique: true, allowNull: false },
  senha: { type: DataTypes.STRING, allowNull: false },
  tipo_usuario: { type: DataTypes.ENUM("gerente","atendente"), defaultValue: "atendente" }
}, {
  tableName: "atendentes",
  timestamps: false
});

module.exports = Atendente;
