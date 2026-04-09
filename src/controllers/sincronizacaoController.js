const Sincronizacao = require("../models/Sincronizacao");
const Pedido = require("../models/Pedido");
const Atendente = require("../models/Atendente");

// Listar todas as sincronizações
const listar = async (req, res) => {
  try {
    const sincronizacoes = await Sincronizacao.findAll({
      order: [["data_hora", "DESC"]]
    });
    res.json(sincronizacoes);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar sincronizações", detalhe: err.message });
  }
};

// Buscar sincronização por ID
const buscarPorId = async (req, res) => {
  try {
    const sync = await Sincronizacao.findByPk(req.params.id);
    if (!sync) return res.status(404).json({ erro: "Sincronização não encontrada" });
    res.json(sync);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar sincronização", detalhe: err.message });
  }
};

// Criar nova sincronização (disparada pelo atendente)
const criar = async (req, res) => {
  try {
    const { id_atendente, id_pedido } = req.body;

    if (!id_atendente) {
      return res.status(400).json({ erro: "id_atendente é obrigatório" });
    }

    const atendente = await Atendente.findByPk(id_atendente);
    if (!atendente) return res.status(404).json({ erro: "Atendente não encontrado" });

    const sync = await Sincronizacao.create({
      id_atendente,
      id_pedido: id_pedido || null,
      status: "concluida",
      data_hora: new Date()
    });

    res.status(201).json({ mensagem: "Sincronização registrada com sucesso", sync });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar sincronização", detalhe: err.message });
  }
};

// Listar sincronizações de um atendente específico
const listarPorAtendente = async (req, res) => {
  try {
    const sincronizacoes = await Sincronizacao.findAll({
      where: { id_atendente: req.params.id_atendente },
      order: [["data_hora", "DESC"]]
    });
    res.json(sincronizacoes);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar sincronizações do atendente", detalhe: err.message });
  }
};

module.exports = { listar, buscarPorId, criar, listarPorAtendente };
