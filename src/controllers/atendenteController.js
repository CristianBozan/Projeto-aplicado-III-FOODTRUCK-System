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
      const { nome, login, senha, cpf, telefone, tipo_usuario } = req.body;
      const novo = await Atendente.create({ nome, login, senha, cpf, telefone, tipo_usuario });
      const { senha: _, ...dados } = novo.toJSON();
      res.status(201).json(dados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atendente = await Atendente.findByPk(id);
      if (!atendente) return res.status(404).json({ message: "Atendente não encontrado" });
      const { nome, login, senha, cpf, telefone, tipo_usuario } = req.body;
      const payload = { nome, login, cpf, telefone, tipo_usuario };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      if (senha) payload.senha = senha;
      await atendente.update(payload);
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
