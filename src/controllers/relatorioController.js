const { Sequelize, Op } = require("sequelize");
const Venda = require("../models/Venda");

// Os dados (data_hora) são gravados em UTC, mas o negócio opera no fuso de Brasília
// (UTC-3). Estas funções montam os limites do filtro no horário de Brasília para que
// "hoje", "este mês" e períodos personalizados batam com o dia civil brasileiro.
const TZ_BR = 'America/Sao_Paulo';
const OFFSET_BR = '-03:00';
function brHoje() {
  // data de hoje no fuso de Brasília, no formato YYYY-MM-DD
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ_BR });
}
function brInicio(ymd) { return new Date(`${ymd}T00:00:00.000${OFFSET_BR}`); }
function brFim(ymd)    { return new Date(`${ymd}T23:59:59.999${OFFSET_BR}`); }
function somaDias(ymd, n) {
  const d = new Date(`${ymd}T12:00:00${OFFSET_BR}`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toLocaleDateString('en-CA', { timeZone: TZ_BR });
}

// Constrói o filtro de data (where.data_hora) no fuso de Brasília.
// Aceita: preset=day|week|month, month=YYYY-MM, start=YYYY-MM-DD, end=YYYY-MM-DD.
function periodoWhere(query) {
  const { start, end, preset, month } = query || {};
  const hoje = brHoje();
  let ini = null;
  let fim = null;

  if (preset === 'day')        { ini = hoje;               fim = hoje; }
  else if (preset === 'week')  { ini = somaDias(hoje, -6); fim = hoje; }
  else if (preset === 'month') { ini = hoje.slice(0, 7) + '-01'; fim = hoje; }

  if (month && /^\d{4}-\d{2}$/.test(String(month))) {
    const [y, m] = String(month).split('-').map(Number);
    const ultimo = new Date(y, m, 0).getDate();
    ini = `${month}-01`;
    fim = `${month}-${String(ultimo).padStart(2, '0')}`;
  }
  if (start) ini = start;
  if (end)   fim = end;

  const where = {};
  if (ini && fim)   where.data_hora = { [Op.between]: [brInicio(ini), brFim(fim)] };
  else if (ini)     where.data_hora = { [Op.gte]: brInicio(ini) };
  return where;
}

module.exports = {
  // Total de vendas por dia
  async vendasPorDia(req, res) {
    try {
      // Filtro de período no fuso de Brasília
      const where = periodoWhere(req.query || {});

      // Agrupa por dia no fuso de Brasília (os dados são gravados em UTC → subtrai 3h)
      const diaBR = Sequelize.literal("DATE(data_hora - INTERVAL 3 HOUR)");
      const vendas = await Venda.findAll({
        attributes: [
          [diaBR, "data"],
          [Sequelize.fn("SUM", Sequelize.col("valor_total")), "total_vendas"]
        ],
        where: Object.keys(where).length ? where : undefined,
        group: [diaBR],
        order: [[diaBR, "ASC"]]
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

  // Resumo geral (faturamento, nº de vendas e ticket médio) — filtrado por período
  async resumo(req, res) {
    try {
      const where = periodoWhere(req.query || {});
      const resumo = await Venda.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("id_venda")), "quantidade_vendas"],
          [Sequelize.fn("SUM", Sequelize.col("valor_total")), "faturamento_total"],
          [Sequelize.fn("AVG", Sequelize.col("valor_total")), "ticket_medio"]
        ],
        where: Object.keys(where).length ? where : undefined
      });
      res.json(resumo[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
