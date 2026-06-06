const Pedido     = require("./Pedido");
const ItemPedido = require("./ItemPedido");
const Produto    = require("./Produto");
const Mesa       = require("./Mesa");
const Atendente  = require("./Atendente");
const EstoqueLog = require("./EstoqueLog");

// Pedido → ItensPedido → Produto (para a rota /pedidos/cozinha)
Pedido.hasMany(ItemPedido, { foreignKey: "id_pedido", as: "ItensPedido" });
ItemPedido.belongsTo(Produto, { foreignKey: "id_produto" });

// Produto → EstoqueLog
Produto.hasMany(EstoqueLog, { foreignKey: "id_produto", as: "Logs" });
EstoqueLog.belongsTo(Produto, { foreignKey: "id_produto" });

module.exports = { Pedido, ItemPedido, Produto, Mesa, Atendente, EstoqueLog };
