const EstoqueLog = require('../models/EstoqueLog');
const { Op } = require('sequelize');

module.exports = {
  // GET /auditoria/estoque
  async listar(req, res){
    try{
      const { id_produto, acao, start, end, limit, offset } = req.query;
      const where = {};
      if(id_produto) where.id_produto = id_produto;
      if(acao) where.acao = acao;
      if(start || end){
        where.data_hora = {};
        if(start) where.data_hora[Op.gte] = new Date(start);
        if(end) where.data_hora[Op.lte] = new Date(end);
      }
      const opts = { where, order: [['data_hora','DESC']] };
      if(limit) opts.limit = parseInt(limit,10) || 100;
      if(offset) opts.offset = parseInt(offset,10) || 0;
      const rows = await EstoqueLog.findAll(opts);
      return res.json({ logs: rows.map(r => r.toJSON()) });
    }catch(err){
      return res.status(500).json({ message: err.message });
    }
  }
};
