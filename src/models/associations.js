const Pedido    = require("./Pedido");
const ItemPedido = require("./ItemPedido");
const Produto   = require("./Produto");
const Mesa      = require("./Mesa");
const Atendente = require("./Atendente");

// Pedido → ItensPedido → Produto (para a rota /pedidos/cozinha)
Pedido.hasMany(ItemPedido, { foreignKey: "id_pedido", as: "ItensPedido" });
ItemPedido.belongsTo(Produto, { foreignKey: "id_produto" });

module.exports = { Pedido, ItemPedido, Produto, Mesa, Atendente };
