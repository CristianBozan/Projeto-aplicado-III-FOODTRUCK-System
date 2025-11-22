const Pedido = require("../models/Pedido");
const Mesa = require("../models/Mesa");
const Atendente = require("../models/Atendente");
const Venda = require("../models/Venda");
const ItemPedido = require("../models/ItemPedido");
const Produto = require("../models/Produto");
const sequelize = require("../config/database");

module.exports = {
  async listar(req, res) {
    try {
      const pedidos = await Pedido.findAll({ include: [Mesa, Atendente] });
      res.json(pedidos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const pedido = await Pedido.findByPk(req.params.id, { include: [Mesa, Atendente] });
      if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });
      res.json(pedido);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req, res) {
    try {
      // permitir id_mesa null (pedido para viagem)
      const payload = { ...req.body };
      // Normalizações: permitir id_mesa e id_atendente como null quando vierem como string vazia
      if (payload.id_mesa === "" || payload.id_mesa === undefined) payload.id_mesa = null;
      if (payload.id_atendente === "" || payload.id_atendente === undefined) payload.id_atendente = null;

      // Valida atendente se informado (somente quando o campo vier no payload)
      if (Object.prototype.hasOwnProperty.call(payload, 'id_atendente') && payload.id_atendente !== null) {
        const atend = await Atendente.findByPk(payload.id_atendente);
        if (!atend) return res.status(400).json({ message: "Atendente não encontrado" });
      }

      // Se vierem itens no payload, processar tudo dentro de uma única transação
      const itens = Array.isArray(payload.itens) ? payload.itens : [];

      const result = await sequelize.transaction(async (t) => {
        // Cria o pedido (sem a chave itens)
        const pedidoPayload = { ...payload };
        delete pedidoPayload.itens;

        const novo = await Pedido.create(pedidoPayload, { transaction: t });

        const itensCriados = [];

        // Se houver itens, validar estoque e criar ItemPedido(s) e decrementar estoque
        if (itens.length > 0) {
          // Agrupa quantidades por produto para validar corretamente
          const somaPorProduto = {};
          itens.forEach(it => {
            const idp = parseInt(it.id_produto);
            const q = parseInt(it.quantidade) || 0;
            if (!somaPorProduto[idp]) somaPorProduto[idp] = 0;
            somaPorProduto[idp] += q;
          });

          // Carrega produtos envolvidos com lock FOR UPDATE para concorrência segura
          const produtosIds = Object.keys(somaPorProduto).map(id => parseInt(id));
          const produtos = await Produto.findAll({ where: { id_produto: produtosIds }, transaction: t, lock: t.LOCK.UPDATE });

          const produtosMap = {};
          produtos.forEach(p => { produtosMap[p.id_produto] = p; });

          // Valida estoque antes de criar qualquer item
          for (const pid of produtosIds) {
            const required = somaPorProduto[pid] || 0;
            const prod = produtosMap[pid];
            if (!prod) throw new Error(`Produto com id ${pid} não encontrado`);
            if (prod.quantidade_estoque < required) {
              throw new Error(`Estoque insuficiente para produto ${prod.nome || pid}`);
            }
          }

          // Tudo ok: criar cada item e decrementar estoque
          for (const it of itens) {
            const idp = parseInt(it.id_produto);
            const quantidade = parseInt(it.quantidade) || 0;
            if (quantidade <= 0) continue;

            const produto = produtosMap[idp];
            const preco_unitario = parseFloat(produto.preco);
            const subtotal = parseFloat((preco_unitario * quantidade).toFixed(2));

            const itemCriado = await ItemPedido.create({
              id_pedido: novo.id_pedido,
              id_produto: idp,
              quantidade,
              preco_unitario,
              subtotal
            }, { transaction: t });

            itensCriados.push(itemCriado);

            // decrementa estoque
            await produto.update({ quantidade_estoque: produto.quantidade_estoque - quantidade }, { transaction: t });
          }
        }

        let vendaCriada = null;

        // Se o pedido já for criado com status finalizado e forma_pagamento presente,
        // criar venda automaticamente
        if (payload.status === "finalizado" && payload.forma_pagamento) {
          vendaCriada = await Venda.create({
            id_pedido: novo.id_pedido,
            forma_pagamento: payload.forma_pagamento,
            valor_total: payload.total || novo.total
          }, { transaction: t });

          // Ao criar a venda automaticamente, marcar o pedido como 'pago'
          await novo.update({ status: 'pago' }, { transaction: t });

          // Se o pedido estava vinculado a uma mesa, liberar a mesa (cliente pagou/foi embora)
          if (novo.id_mesa) {
            await Mesa.update({ status: 'livre' }, { where: { id_mesa: novo.id_mesa }, transaction: t });
          }
        }

        // Se pedido tiver mesa (e não for viagem) e status não indicar viagem, marcar mesa ocupada
        if (novo.id_mesa) {
          await Mesa.update({ status: "ocupada" }, { where: { id_mesa: novo.id_mesa }, transaction: t });
        }

        return { novo, itensCriados, vendaCriada };
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findByPk(id);
      if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

      // Keep previous mesa to update status if needed
      const previousMesaId = pedido.id_mesa;

      // Normalize incoming id_mesa and id_atendente for "para viagem" / empty values
      // Important: only coerce to null when the field is explicitly provided (to avoid wiping existing values)
      const payload = { ...req.body };
      if (Object.prototype.hasOwnProperty.call(payload, 'id_mesa')) {
        if (payload.id_mesa === "" || payload.id_mesa === undefined) payload.id_mesa = null;
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'id_atendente')) {
        if (payload.id_atendente === "" || payload.id_atendente === undefined) payload.id_atendente = null;
      }

      // Valida atendente se informado (somente quando o campo vier no payload)
      if (Object.prototype.hasOwnProperty.call(payload, 'id_atendente') && payload.id_atendente !== null) {
        const atend = await Atendente.findByPk(payload.id_atendente);
        if (!atend) return res.status(400).json({ message: "Atendente não encontrado" });
      }

      // Usar transação para consistência: atualizar pedido, possivelmente criar venda
      const result = await sequelize.transaction(async (t) => {
        const updated = await pedido.update(payload, { transaction: t });

        let vendaCriada = null;

        // If status changed to finalizado or cancelado, free the mesa if exists
        if (payload.status && (payload.status === "finalizado" || payload.status === "cancelado")) {
          const mesaIdToFree = updated.id_mesa || previousMesaId;
          if (mesaIdToFree) {
            // set mesa status to 'livre'
            await Mesa.update({ status: "livre" }, { where: { id_mesa: mesaIdToFree }, transaction: t });
          }
        }

        // Se status finalizado, registrar venda automaticamente (se houver forma_pagamento)
        if (payload.status === "finalizado") {
          const forma = payload.forma_pagamento || updated.forma_pagamento;
          const valor = payload.total || updated.total;
          if (forma) {
            vendaCriada = await Venda.create({ id_pedido: updated.id_pedido, forma_pagamento: forma, valor_total: valor }, { transaction: t });

            // Marcar pedido como pago dentro da mesma transação
            await updated.update({ status: 'pago' }, { transaction: t });

            // Se o pedido estiver vinculado a uma mesa, garantir que a mesa seja liberada
            if (updated.id_mesa) {
              await Mesa.update({ status: 'livre' }, { where: { id_mesa: updated.id_mesa }, transaction: t });
            }
          }
        }

        return { updated, vendaCriada };
      });

      res.json({ message: "Pedido atualizado com sucesso", result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findByPk(id);
      if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

      // Deletar pedido e dependências dentro de transação para evitar FK errors
      await sequelize.transaction(async (t) => {
        // Apaga itens do pedido
        const ItemPedido = require('../models/ItemPedido');
        await ItemPedido.destroy({ where: { id_pedido: id }, transaction: t });

        // Apaga vendas vinculadas
        await Venda.destroy({ where: { id_pedido: id }, transaction: t });

        // Remove o pedido
        await Pedido.destroy({ where: { id_pedido: id }, transaction: t });

        // Se pedido estava vinculado a uma mesa, libera a mesa
        if (pedido.id_mesa) {
          await Mesa.update({ status: 'livre' }, { where: { id_mesa: pedido.id_mesa }, transaction: t });
        }
      });

      res.json({ message: "Pedido removido com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
