const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Pedido = require("./Pedido");
const Produto = require("./Produto");

const ItemPedido = sequelize.define("ItemPedido", {
  id_item: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  preco_unitario: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, {
  tableName: "itens_pedido",
  timestamps: false
});

// Relacionamentos
ItemPedido.belongsTo(Pedido, { foreignKey: "id_pedido" });
ItemPedido.belongsTo(Produto, { foreignKey: "id_produto" });

module.exports = ItemPedido;
