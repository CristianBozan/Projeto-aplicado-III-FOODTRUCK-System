const Backup = require('../models/Backup');
const Venda = require('../models/Venda');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const sequelize = require('../config/database');
const ExcelJS = require('exceljs');
const Produto = require('../models/Produto');
const EstoqueLog = require('../models/EstoqueLog');

// Helper: formata nome padrão BKP_DIA_MES_ANO
function defaultBackupName(date = new Date()){
  const d = date.getDate().toString().padStart(2,'0');
  const m = (date.getMonth()+1).toString().padStart(2,'0');
  const y = date.getFullYear();
  return `BKP_${d}_${m}_${y}`;
}

module.exports = {
  // API handler para criar backup (manual)
  async criar(req, res){
    try{
      const nomeRecebido = req.body && req.body.nome ? String(req.body.nome).trim() : null;
      const nome = nomeRecebido && nomeRecebido.length>0 ? nomeRecebido : defaultBackupName();
      const backup = await module.exports.createBackup(nome);
      return res.status(201).json({ message: 'Backup criado com sucesso', backupId: backup.id_backup, nome: backup.nome });
    }catch(err){
      return res.status(500).json({ message: err.message });
    }
  },

  // Cria backup programaticamente e retorna o registro criado
  async createBackup(nome){
    // carrega dados essenciais: vendas, pedidos (com itens) e agregação simples para dashboard
    const t = await sequelize.transaction();
    try{
      const vendas = await Venda.findAll({ transaction: t });
      const pedidos = await Pedido.findAll({ transaction: t });
      const itens = await ItemPedido.findAll({ transaction: t });
      const produtos = await require('../models/Produto').findAll({ transaction: t });

      // Converter instâncias Sequelize para objetos plain para garantir
      // serialização consistente e evitar propriedades/metadata inesperadas
      const vendasPlain = vendas.map(v => (v && v.toJSON) ? v.toJSON() : v);
      const itensPlain = itens.map(i => (i && i.toJSON) ? i.toJSON() : i);
      const produtosPlain = produtos.map(p => (p && p.toJSON) ? p.toJSON() : p);

      // agrega itens por pedido (usando objetos plain)
      const itensPorPedido = {};
      itensPlain.forEach(it => {
        const pid = it.id_pedido;
        if (!itensPorPedido[pid]) itensPorPedido[pid] = [];
        itensPorPedido[pid].push(it);
      });

      // juntar pedidos (plain) com seus itens
      const pedidosComItens = pedidos.map(p => {
        const pj = (p && p.toJSON) ? p.toJSON() : p;
        return { ...pj, itens: itensPorPedido[pj.id_pedido] || [] };
      });

      // calcula vendasPorDia a partir de vendasPlain
      const vendasPorDiaMap = {};
      vendasPlain.forEach(v => {
        const d = new Date(v.data_hora).toISOString().slice(0,10); // YYYY-MM-DD
        vendasPorDiaMap[d] = (vendasPorDiaMap[d] || 0) + parseFloat(v.valor_total || 0);
      });
      const vendasPorDia = Object.keys(vendasPorDiaMap).sort().map(k => ({ data: k, total_vendas: vendasPorDiaMap[k] }));
      const conteudo = { vendas: vendasPlain, pedidos: pedidosComItens, produtos: produtosPlain, vendasPorDia, gerado_em: new Date() };
      const registro = await Backup.create({ nome, conteudo_json: JSON.stringify(conteudo), data_hora: new Date() }, { transaction: t });
      await t.commit();
      return registro;
    }catch(err){
      await t.rollback();
      throw err;
    }
  },

  // lista backups
  async listar(req, res){
    try{
      const rows = await Backup.findAll({ order: [['data_hora','DESC']] });
      const list = rows.map(r => ({ id: r.id_backup, nome: r.nome, data_hora: r.data_hora }));
      return res.json({ backups: list });
    }catch(err){
      return res.status(500).json({ message: err.message });
    }
  },

  // retorna backup (visualizar/download) por id
  async buscarPorId(req, res){
    try{
      const { id } = req.params;
      const b = await Backup.findByPk(id);
      if(!b) return res.status(404).json({ message: 'Backup não encontrado' });
      // fornece JSON do conteúdo
      const conteudo = JSON.parse(b.conteudo_json);
      return res.json({ id: b.id_backup, nome: b.nome, data_hora: b.data_hora, conteudo });
    }catch(err){
      return res.status(500).json({ message: err.message });
    }
  },

  // rota para download como arquivo .json
  async download(req, res){
    try{
      const { id } = req.params;
      const b = await Backup.findByPk(id);
      if(!b) return res.status(404).json({ message: 'Backup não encontrado' });
      const filename = `${b.nome}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.send(b.conteudo_json);
    }catch(err){
      return res.status(500).json({ message: err.message });
    }
  },

  // Gera e retorna arquivo Excel (.xlsx) para um backup
  async excel(req, res){
    try{
      const { id } = req.params;
      const b = await Backup.findByPk(id);
      if(!b) return res.status(404).json({ message: 'Backup não encontrado' });
      const conteudo = JSON.parse(b.conteudo_json);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FoodTruck System';
      workbook.created = new Date();

      // Vendas sheet
      const vendas = Array.isArray(conteudo.vendas) ? conteudo.vendas : [];
      const wsVendas = workbook.addWorksheet('Vendas');
      wsVendas.addRow(['id_venda','data_hora','valor_total','forma_pagamento','id_pedido']);
      vendas.forEach(v => {
        wsVendas.addRow([v.id_venda, v.data_hora, v.valor_total, v.forma_pagamento, v.id_pedido]);
      });

      // Pedidos sheet
      const pedidos = Array.isArray(conteudo.pedidos) ? conteudo.pedidos : [];
      const wsPedidos = workbook.addWorksheet('Pedidos');
      wsPedidos.addRow(['id_pedido','data_hora','id_atendente','id_mesa','forma_pagamento','status','observacoes','total']);
      pedidos.forEach(p => {
        wsPedidos.addRow([p.id_pedido, p.data_hora, p.id_atendente, p.id_mesa, p.forma_pagamento, p.status, p.observacoes, p.total]);
      });

      // Itens sheet (todos os itens agrupados)
      const itens = [];
      pedidos.forEach(p => {
        if (Array.isArray(p.itens)) {
          p.itens.forEach(it => itens.push({ id_item: it.id_item, id_pedido: p.id_pedido, id_produto: it.id_produto, quantidade: it.quantidade, preco_unitario: it.preco_unitario, subtotal: it.subtotal }));
        }
      });
      const wsItens = workbook.addWorksheet('Itens');
      wsItens.addRow(['id_item','id_pedido','id_produto','quantidade','preco_unitario','subtotal']);
      itens.forEach(it => wsItens.addRow([it.id_item, it.id_pedido, it.id_produto, it.quantidade, it.preco_unitario, it.subtotal]));

      // Vendas por dia
      const vendasPorDia = Array.isArray(conteudo.vendasPorDia) ? conteudo.vendasPorDia : [];
      const wsVPD = workbook.addWorksheet('VendasPorDia');
      wsVPD.addRow(['data','total_vendas']);
      vendasPorDia.forEach(r => wsVPD.addRow([r.data, r.total_vendas]));

      // Produtos (se disponíveis)
      const produtos = Array.isArray(conteudo.produtos) ? conteudo.produtos : null;
      if(produtos){
        const wsProdutos = workbook.addWorksheet('Produtos');
        wsProdutos.addRow(['id_produto','nome','descricao','preco','foto','categoria','quantidade_estoque','status']);
        produtos.forEach(p => {
          // p pode ser instância Sequelize ou plain object
          const pp = p.toJSON ? p.toJSON() : p;
          wsProdutos.addRow([pp.id_produto || pp.id, pp.nome, pp.descricao, pp.preco, pp.foto, pp.categoria, pp.quantidade_estoque, pp.status]);
        });
      }

      // Gerar buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `${b.nome}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }catch(err){
      return res.status(500).json({ message: err.message });
    }
  },

  // Restaurar backup por id
  // body: { mode: 'safe'|'force' }
  async restore(req, res){
    try{
      const { id } = req.params;
      const mode = (req.body && req.body.mode) ? String(req.body.mode).toLowerCase() : 'safe';
      const b = await Backup.findByPk(id);
      if(!b) return res.status(404).json({ message: 'Backup não encontrado' });
      const conteudo = JSON.parse(b.conteudo_json);
      const pedidos = Array.isArray(conteudo.pedidos) ? conteudo.pedidos : [];
      const vendas = Array.isArray(conteudo.vendas) ? conteudo.vendas : [];

      // Política de restauração:
      // - 'safe': insere registros que não existirem (por id). Não remove nem altera registros existentes.
      // - 'force': remove todos os pedidos/itens/vendas atuais e recria a partir do backup (DESTRUTIVO).

      const t = await sequelize.transaction();
      const result = { pedidosCreated:0, pedidosSkipped:0, itensCreated:0, vendasCreated:0, vendasSkipped:0 };
      try{
        if(mode === 'force'){
          // deletar dependências e recriar tudo
          await ItemPedido.destroy({ where: {}, transaction: t });
          await Venda.destroy({ where: {}, transaction: t });
          await Pedido.destroy({ where: {}, transaction: t });

          // recriar pedidos e itens
          for(const p of pedidos){
            const { itens, ...pedidoPayload } = p;
            // criar mantendo id_pedido (aceita PK explicitamente)
            await Pedido.create(pedidoPayload, { transaction: t });
            result.pedidosCreated++;
            if(Array.isArray(itens)){
              for(const it of itens){
                await ItemPedido.create(it, { transaction: t });
                result.itensCreated++;
              }
            }
          }

          // recriar vendas
          for(const v of vendas){
            await Venda.create(v, { transaction: t });
            result.vendasCreated++;
          }
          // Restaurar produtos: sobrescrever ou criar com snapshot
          if(Array.isArray(conteudo.produtos)){
            for(const p of conteudo.produtos){
              const pp = p.toJSON ? p.toJSON() : p;
              const existing = await Produto.findByPk(pp.id_produto, { transaction: t });
              const payload = {
                nome: pp.nome,
                descricao: pp.descricao,
                preco: pp.preco,
                foto: pp.foto,
                categoria: pp.categoria,
                quantidade_estoque: pp.quantidade_estoque || 0,
                status: pp.status || 'ativo'
              };
              if(existing){
                const prevQty = existing.quantidade_estoque == null ? 0 : existing.quantidade_estoque;
                await existing.update(payload, { transaction: t });
                const newQty = payload.quantidade_estoque || 0;
                if(prevQty !== newQty){
                  await EstoqueLog.create({ id_produto: pp.id_produto, acao: 'update', quantidade_anterior: prevQty, quantidade_nova: newQty, nota: 'restore force', data_hora: new Date() }, { transaction: t });
                }
              } else {
                const created = await Produto.create(Object.assign({ id_produto: pp.id_produto }, payload), { transaction: t });
                await EstoqueLog.create({ id_produto: created.id_produto || pp.id_produto, acao: 'create', quantidade_anterior: null, quantidade_nova: payload.quantidade_estoque || 0, nota: 'restore force - created', data_hora: new Date() }, { transaction: t });
              }
            }
          }
        } else {
          // modo safe: insere apenas registros ausentes
          for(const p of pedidos){
            const exists = await Pedido.findByPk(p.id_pedido, { transaction: t });
            if(exists){
              result.pedidosSkipped++;
            } else {
              const { itens, ...pedidoPayload } = p;
              await Pedido.create(pedidoPayload, { transaction: t });
              result.pedidosCreated++;
              if(Array.isArray(itens)){
                for(const it of itens){
                  const itExists = await ItemPedido.findByPk(it.id_item, { transaction: t });
                  if(!itExists){
                    await ItemPedido.create(it, { transaction: t });
                    result.itensCreated++;
                  }
                }
              }
            }
          }

          // vendas
          for(const v of vendas){
            const existsV = await Venda.findByPk(v.id_venda, { transaction: t });
            if(existsV){
              result.vendasSkipped++;
            } else {
              await Venda.create(v, { transaction: t });
              result.vendasCreated++;
            }
          }
          // Restaurar estoques em modo safe: atualiza apenas produtos existentes quando estoque atual for 0
          if(Array.isArray(conteudo.produtos)){
            for(const p of conteudo.produtos){
              const pp = p.toJSON ? p.toJSON() : p;
              const existing = await Produto.findByPk(pp.id_produto, { transaction: t });
              if(existing){
                const current = existing.quantidade_estoque == null ? 0 : existing.quantidade_estoque;
                // política safe: somente ajustar se estoque atual for 0 (ausente)
                if(current === 0){
                  const newQty = pp.quantidade_estoque || 0;
                  await existing.update({ quantidade_estoque: newQty }, { transaction: t });
                  await EstoqueLog.create({ id_produto: pp.id_produto, acao: 'update', quantidade_anterior: current, quantidade_nova: newQty, nota: 'restore safe', data_hora: new Date() }, { transaction: t });
                }
              }
            }
          }
        }

        await t.commit();
        return res.json({ message: 'Restauração concluída', mode, result });
      }catch(err){
        await t.rollback();
        throw err;
      }
    }catch(err){
      return res.status(500).json({ message: err.message });
    }
  }
};
