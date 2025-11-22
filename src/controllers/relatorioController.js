const { Sequelize, Op } = require("sequelize");
const Venda = require("../models/Venda");

module.exports = {
  // Total de vendas por dia
  async vendasPorDia(req, res) {
    try {
      // aceita filtros via query params: start=YYYY-MM-DD, end=YYYY-MM-DD, preset=day|week|month, month=YYYY-MM
      const { start, end, preset, month } = req.query || {};

      let startDate = null;
      let endDate = null;

      const now = new Date();

      if (preset) {
        if (preset === 'day') {
          startDate = new Date(now.toISOString().slice(0,10));
          endDate = new Date(startDate);
        } else if (preset === 'week') {
          endDate = new Date(now.toISOString().slice(0,10));
          startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6); // last 7 days
        } else if (preset === 'month') {
          // current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
      }

      if (month) {
        // month format YYYY-MM
        const parts = String(month).split('-');
        if (parts.length === 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          startDate = new Date(y, m, 1);
          endDate = new Date(y, m + 1, 0);
        }
      }

      if (start) {
        const s = new Date(start);
        if (!isNaN(s)) startDate = s;
      }
      if (end) {
        const e = new Date(end);
        if (!isNaN(e)) endDate = e;
      }

      const where = {};
      if (startDate && endDate) {
        // expand to include the whole end day
        const endWithTime = new Date(endDate);
        endWithTime.setHours(23,59,59,999);
        where.data_hora = { [Op.between]: [startDate, endWithTime] };
      } else if (startDate) {
        const endWithTime = new Date(startDate);
        endWithTime.setHours(23,59,59,999);
        where.data_hora = { [Op.between]: [startDate, endWithTime] };
      }

      const vendas = await Venda.findAll({
        attributes: [
          [Sequelize.fn("DATE", Sequelize.col("data_hora")), "data"],
          [Sequelize.fn("SUM", Sequelize.col("valor_total")), "total_vendas"]
        ],
        where: Object.keys(where).length ? where : undefined,
        group: [Sequelize.fn("DATE", Sequelize.col("data_hora"))],
        order: [[Sequelize.fn("DATE", Sequelize.col("data_hora")), "ASC"]]
      });

      // Normaliza o retorno para objetos plain: { data: 'YYYY-MM-DD', total_vendas: number }
      const result = vendas.map(v => {
        // v pode ser uma instância Sequelize ou um plain object
        let dataVal = null;
        let totalVal = null;
        try {
          if (v && typeof v.get === 'function') {
            dataVal = v.get('data');
            totalVal = v.get('total_vendas');
          } else if (v && v.dataValues) {
            dataVal = v.dataValues.data;
            totalVal = v.dataValues.total_vendas;
          } else if (v && v.data !== undefined) {
            dataVal = v.data;
            totalVal = v.total_vendas;
          }
        } catch (err) {
          // fallback generico
          dataVal = v.data || (v.dataValues && v.dataValues.data) || null;
          totalVal = v.total_vendas || (v.dataValues && v.dataValues.total_vendas) || 0;
        }

        // normaliza data para string YYYY-MM-DD
        let dataStr = null;
        if (dataVal instanceof Date) {
          dataStr = dataVal.toISOString().slice(0,10);
        } else if (typeof dataVal === 'string') {
          dataStr = dataVal.slice(0,10);
        } else if (dataVal && dataVal.toString) {
          dataStr = String(dataVal).slice(0,10);
        }

        const totalNum = parseFloat(totalVal) || 0;

        return { data: dataStr, total_vendas: totalNum };
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Total de vendas por forma de pagamento
  async vendasPorPagamento(req, res) {
    try {
      const vendas = await Venda.findAll({
        attributes: [
          "forma_pagamento",
          [Sequelize.fn("SUM", Sequelize.col("valor_total")), "total_vendas"]
        ],
        group: ["forma_pagamento"]
      });
      res.json(vendas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Total de vendas por atendente (soma das vendas agrupadas por atendente)
  // (vendasPorAtendente removida)

  // Total de vendas por atendente (soma das vendas agrupadas por atendente)
  async vendasPorAtendente(req, res) {
    try {
      // aceita query param: top (número de atendentes a retornar)
  const top = parseInt(req.query?.top, 10) || null;
  const atendenteParam = req.query?.atendente ? parseInt(req.query.atendente, 10) : null;

      // Join: Venda -> Pedido -> Atendente
      const Pedido = require('../models/Pedido');
      const Atendente = require('../models/Atendente');

      // build include for Pedido, optionally filtering by atendente
      const includePedido = {
        model: Pedido,
        attributes: [],
        include: [{ model: Atendente, attributes: [] }]
      };
      if (atendenteParam && Number.isInteger(atendenteParam) && atendenteParam > 0) {
        includePedido.where = { id_atendente: atendenteParam };
      }

      const opts = {
        attributes: [
          [Sequelize.col('Pedido.id_atendente'), 'id_atendente'],
          [Sequelize.col('Pedido.Atendente.nome'), 'nome_atendente'],
          [Sequelize.fn('SUM', Sequelize.col('valor_total')), 'total_vendas']
        ],
        include: [includePedido],
        group: ['Pedido.id_atendente', 'Pedido->Atendente.nome'],
        order: [[Sequelize.fn('SUM', Sequelize.col('valor_total')), 'DESC']]
      };

      if (top && Number.isInteger(top) && top > 0) {
        opts.limit = top;
      }

      const vendas = await Venda.findAll(opts);

      const result = vendas.map(v => ({
        id_atendente: v.get('id_atendente'),
        nome_atendente: v.get('nome_atendente') || 'Sem atendente',
        total_vendas: v.get('total_vendas')
      }));

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Resumo geral
  async resumo(req, res) {
    try {
      const resumo = await Venda.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("id_venda")), "quantidade_vendas"],
          [Sequelize.fn("SUM", Sequelize.col("valor_total")), "faturamento_total"],
          [Sequelize.fn("AVG", Sequelize.col("valor_total")), "ticket_medio"]
        ]
      });
      res.json(resumo[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
