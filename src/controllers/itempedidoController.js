const ItemPedido = require("../models/ItemPedido");
const Produto = require("../models/Produto");
const sequelize = require("../config/database");

module.exports = {
  async listar(req, res) {
    try {
      const itens = await ItemPedido.findAll({ include: [Produto] });
      res.json(itens);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const item = await ItemPedido.findByPk(req.params.id, { include: [Produto] });
      if (!item) return res.status(404).json({ message: "Item não encontrado" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      const { quantidade, id_pedido, id_produto } = req.body;

      // Busca o produto para pegar o preço
      const produto = await Produto.findByPk(id_produto);
      if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
      const qtd = parseInt(quantidade) || 0;
      const preco_unitario = produto.preco;
      const subtotal = qtd * preco_unitario;

      if (qtd <= 0) return res.status(400).json({ message: "Quantidade inválida" });

      // checar estoque disponível
      const estoqueAtual = parseInt(produto.quantidade_estoque) || 0;
      if (estoqueAtual < qtd) return res.status(400).json({ message: "Estoque insuficiente" });

      // criar item e decrementar estoque na mesma transação
      const novo = await sequelize.transaction(async (t) => {
        const created = await ItemPedido.create({ quantidade: qtd, preco_unitario, subtotal, id_pedido, id_produto }, { transaction: t });
        await Produto.update({ quantidade_estoque: estoqueAtual - qtd }, { where: { id_produto }, transaction: t });
        return created;
      });

      res.status(201).json(novo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { quantidade, id_produto } = req.body;

      // Buscar item atual para ajustar estoque corretamente
      const itemAtual = await ItemPedido.findByPk(id);
      if (!itemAtual) return res.status(404).json({ message: "Item não encontrado" });

      const novoProdId = id_produto || itemAtual.id_produto;
      const novoQtd = parseInt(quantidade) || itemAtual.quantidade;

      // Se produto foi alterado, precisamos restaurar estoque do antigo e debitar do novo
      await sequelize.transaction(async (t) => {
        // Caso troque de produto
        if (String(novoProdId) !== String(itemAtual.id_produto)) {
          // restaurar estoque do produto antigo
          const produtoAntigo = await Produto.findByPk(itemAtual.id_produto, { transaction: t });
          if (produtoAntigo) {
            const estoqueAntigo = parseInt(produtoAntigo.quantidade_estoque) || 0;
            await Produto.update({ quantidade_estoque: estoqueAntigo + parseInt(itemAtual.quantidade) }, { where: { id_produto: itemAtual.id_produto }, transaction: t });
          }

          // debitar estoque do novo produto
          const produtoNovo = await Produto.findByPk(novoProdId, { transaction: t });
          if (!produtoNovo) throw new Error('Produto não encontrado');
          const estoqueNovo = parseInt(produtoNovo.quantidade_estoque) || 0;
          if (estoqueNovo < novoQtd) throw new Error('Estoque insuficiente para o novo produto');
          await Produto.update({ quantidade_estoque: estoqueNovo - novoQtd }, { where: { id_produto: novoProdId }, transaction: t });

        } else {
          // mesmo produto: ajustar diferença
          const diff = novoQtd - parseInt(itemAtual.quantidade);
          if (diff !== 0) {
            const produtoAtual = await Produto.findByPk(itemAtual.id_produto, { transaction: t });
            const estoqueAtual = parseInt(produtoAtual.quantidade_estoque) || 0;
            if (diff > 0 && estoqueAtual < diff) throw new Error('Estoque insuficiente para aumento de quantidade');
            await Produto.update({ quantidade_estoque: estoqueAtual - diff }, { where: { id_produto: itemAtual.id_produto }, transaction: t });
          }
        }

        // Atualiza o item
        const preco_unitario = (await Produto.findByPk(novoProdId, { transaction: t })).preco;
        const subtotal = novoQtd * preco_unitario;
        const [atualizado] = await ItemPedido.update({ quantidade: novoQtd, preco_unitario, subtotal, id_produto: novoProdId }, { where: { id_item: id }, transaction: t });
        if (!atualizado) throw new Error('Item não atualizado');
      });

      res.json({ message: "Item atualizado com sucesso" });
    } catch (err) {
      // errors from transaction or estoque insuficiente
      if (err && String(err.message).toLowerCase().includes('estoque')) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      // antes de deletar, restaurar estoque
      const item = await ItemPedido.findByPk(id);
      if (!item) return res.status(404).json({ message: "Item não encontrado" });

      await sequelize.transaction(async (t) => {
        const produto = await Produto.findByPk(item.id_produto, { transaction: t });
        if (produto) {
          const estoqueAtual = parseInt(produto.quantidade_estoque) || 0;
          await Produto.update({ quantidade_estoque: estoqueAtual + parseInt(item.quantidade) }, { where: { id_produto: item.id_produto }, transaction: t });
        }
        await ItemPedido.destroy({ where: { id_item: id }, transaction: t });
      });

      res.json({ message: "Item removido com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

