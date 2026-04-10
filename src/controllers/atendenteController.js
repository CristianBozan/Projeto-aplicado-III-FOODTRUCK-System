const Atendente = require("../models/Atendente");

const semSenha = { exclude: ["senha"] };

module.exports = {
  async listar(req, res) {
    try {
      const atendentes = await Atendente.findAll({ attributes: semSenha });
      res.json(atendentes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const atendente = await Atendente.findByPk(req.params.id, { attributes: semSenha });
      if (!atendente) return res.status(404).json({ message: "Atendente não encontrado" });
      res.json(atendente);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      const novo = await Atendente.create(req.body);
      const { senha, ...dados } = novo.toJSON();
      res.status(201).json(dados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      // Usar findByPk + save para que os hooks beforeUpdate sejam disparados
      const atendente = await Atendente.findByPk(id);
      if (!atendente) return res.status(404).json({ message: "Atendente não encontrado" });
      await atendente.update(req.body);
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
