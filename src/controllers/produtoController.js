const Produto = require("../models/Produto");
const { Op } = require("sequelize");

module.exports = {
  async listar(req, res) {
    try {
      const { search } = req.query;
      let where = {};

      if (search && search.trim() !== "") {
        const term = `%${search.trim()}%`;
        where = {
          [Op.or]: [
            { nome: { [Op.like]: term } },
            { categoria: { [Op.like]: term } },
            { descricao: { [Op.like]: term } }
          ]
        };
      }
      console.log('GET /produtos search=', search);
      let produtos = await Produto.findAll({ where });
      // proteção contra possíveis duplicações vindas do banco/joins: deduplicar por id_produto
      const seen = new Set();
      const unique = [];
      produtos.forEach(p => {
        const id = p.id_produto || p.dataValues && p.dataValues.id_produto;
        if (!seen.has(id)) {
          seen.add(id);
          unique.push(p);
        }
      });
      if (unique.length !== produtos.length) {
        console.log(`GET /produtos: deduplicated ${produtos.length} -> ${unique.length}`);
      }
      produtos = unique;
      res.json(produtos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const produto = await Produto.findByPk(req.params.id);
      if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(produto);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      const novo = await Produto.create(req.body);
      res.status(201).json(novo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const [atualizado] = await Produto.update(req.body, { where: { id_produto: id } });
      if (!atualizado) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ message: "Produto atualizado com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const deletado = await Produto.destroy({ where: { id_produto: id } });
      if (!deletado) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ message: "Produto removido com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
