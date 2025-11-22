const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Mesa = require("./Mesa");
const Atendente = require("./Atendente");

const Pedido = sequelize.define("Pedido", {
  id_pedido: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  data_hora: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  id_atendente: { type: DataTypes.INTEGER, allowNull: true },
  id_mesa: { type: DataTypes.INTEGER, allowNull: true },
  forma_pagamento: { type: DataTypes.ENUM("pix","credito","debito","dinheiro","mix"), allowNull: true },
  status: { type: DataTypes.ENUM("aberto","finalizado","cancelado","pago"), defaultValue: "aberto" },
  observacoes: { type: DataTypes.TEXT },
  total: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
}, {
  tableName: "pedidos",
  timestamps: false
});

// Relacionamentos
Pedido.belongsTo(Mesa, { foreignKey: "id_mesa" });
Pedido.belongsTo(Atendente, { foreignKey: "id_atendente" });

module.exports = Pedido;
