const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Produto = sequelize.define("Produto", {
  id_produto: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT },
  preco: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  foto: { type: DataTypes.STRING },
  categoria: { type: DataTypes.STRING },
  quantidade_estoque: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM("ativo","inativo"), defaultValue: "ativo" }
}, {
  tableName: "produtos",
  timestamps: false
});

module.exports = Produto;
