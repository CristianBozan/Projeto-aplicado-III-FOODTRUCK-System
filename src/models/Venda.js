const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Pedido = require("./Pedido");

const Venda = sequelize.define("Venda", {
  id_venda: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  data_hora: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  valor_total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  forma_pagamento: { type: DataTypes.ENUM("pix","credito","debito","dinheiro","mix"), allowNull: false }
}, {
  tableName: "vendas",
  timestamps: false
});

// Relacionamento: cada venda pertence a um pedido
Venda.belongsTo(Pedido, { foreignKey: "id_pedido" });

module.exports = Venda;
