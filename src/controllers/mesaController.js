const Mesa = require("../models/Mesa");

module.exports = {
  async listar(req, res) {
    try {
      const mesas = await Mesa.findAll();
      res.json(mesas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const mesa = await Mesa.findByPk(req.params.id);
      if (!mesa) return res.status(404).json({ message: "Mesa não encontrada" });
      res.json(mesa);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      const nova = await Mesa.create(req.body);
      res.status(201).json(nova);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const [atualizado] = await Mesa.update(req.body, { where: { id_mesa: id } });
      if (!atualizado) return res.status(404).json({ message: "Mesa não encontrada" });
      res.json({ message: "Mesa atualizada com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const deletado = await Mesa.destroy({ where: { id_mesa: id } });
      if (!deletado) return res.status(404).json({ message: "Mesa não encontrada" });
      res.json({ message: "Mesa removida com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
