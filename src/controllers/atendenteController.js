const Atendente = require("../models/Atendente");

// Campos retornados nas respostas (senha nunca exposta)
const ATRIBUTOS_PUBLICOS = ['id_atendente', 'nome', 'cpf', 'telefone', 'login', 'tipo_usuario'];

module.exports = {
  async listar(req, res) {
    try {
      const atendentes = await Atendente.findAll({ attributes: ATRIBUTOS_PUBLICOS });
      res.json(atendentes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const atendente = await Atendente.findByPk(req.params.id, { attributes: ATRIBUTOS_PUBLICOS });
      if (!atendente) return res.status(404).json({ message: "Atendente não encontrado" });
      res.json(atendente);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      const novo = await Atendente.create(req.body);
      const { senha: _s, ...semSenha } = novo.toJSON();
      res.status(201).json(semSenha);
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
