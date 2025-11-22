const Venda = require("../models/Venda");
const Pedido = require("../models/Pedido");
const Mesa = require("../models/Mesa");

module.exports = {
  async listar(req, res) {
    try {
      const vendas = await Venda.findAll({ include: [Pedido] });
      res.json(vendas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const venda = await Venda.findByPk(req.params.id, { include: [Pedido] });
      if (!venda) return res.status(404).json({ message: "Venda não encontrada" });
      res.json(venda);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      const { id_pedido, forma_pagamento, valor_total } = req.body;

      // Confere se o pedido existe
      const pedido = await Pedido.findByPk(id_pedido);
      if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

      // Cria a venda
      const nova = await Venda.create({
        id_pedido,
        forma_pagamento,
        valor_total
      });

      // Atualiza status do pedido
      await pedido.update({ status: "pago" });

      // Se o pedido estava vinculado a uma mesa, libera a mesa
      if (pedido.id_mesa) {
        await Mesa.update({ status: "livre" }, { where: { id_mesa: pedido.id_mesa } });
      }

      res.status(201).json(nova);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const deletado = await Venda.destroy({ where: { id_venda: id } });
      if (!deletado) return res.status(404).json({ message: "Venda não encontrada" });
      res.json({ message: "Venda removida com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

