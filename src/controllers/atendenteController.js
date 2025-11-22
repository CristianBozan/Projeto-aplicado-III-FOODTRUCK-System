const Atendente = require("../models/Atendente");

module.exports = {
  async listar(req, res) {
    try {
      const atendentes = await Atendente.findAll();
      res.json(atendentes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const atendente = await Atendente.findByPk(req.params.id);
      if (!atendente) return res.status(404).json({ message: "Atendente não encontrado" });
      res.json(atendente);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      const novo = await Atendente.create(req.body);
      res.status(201).json(novo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const [atualizado] = await Atendente.update(req.body, { where: { id_atendente: id } });
      if (!atualizado) return res.status(404).json({ message: "Atendente não encontrado" });
      res.json({ message: "Atendente atualizado com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const deletado = await Atendente.destroy({ where: { id_atendente: id } });
      if (!deletado) return res.status(404).json({ message: "Atendente não encontrado" });
      res.json({ message: "Atendente removido com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
