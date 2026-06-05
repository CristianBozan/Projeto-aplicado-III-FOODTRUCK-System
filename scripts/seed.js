/**
 * Script de seed — popula o banco com dados de demonstração.
 * Execute com:  node scripts/seed.js
 *
 * - Cria atendentes (ignora se já existir mesmo login)
 * - Cria/atualiza produtos com estoque
 * - Cria mesas (1-8)
 * - Gera 20 pedidos finalizados dos últimos 30 dias com itens e vendas
 */

require("dotenv").config();
const sequelize  = require("../src/config/database");
const Atendente  = require("../src/models/Atendente");
const Produto    = require("../src/models/Produto");
const Mesa       = require("../src/models/Mesa");
const Pedido     = require("../src/models/Pedido");
const ItemPedido = require("../src/models/ItemPedido");
const Venda      = require("../src/models/Venda");

// ─── Dados base ───────────────────────────────────────────────────────────────

const ATENDENTES = [
  { nome: "Maria Silva",    cpf: "11122233344", telefone: "48991110001", login: "maria",  senha: "maria123",  tipo_usuario: "atendente" },
  { nome: "João Oliveira",  cpf: "22233344455", telefone: "48991110002", login: "joao",   senha: "joao123",   tipo_usuario: "atendente" },
  { nome: "Ana Costa",      cpf: "33344455566", telefone: "48991110003", login: "ana",    senha: "ana123",    tipo_usuario: "gerente"   },
  { nome: "Pedro Santos",   cpf: "44455566677", telefone: "48991110004", login: "pedro",  senha: "pedro123",  tipo_usuario: "atendente" },
];

const PRODUTOS = [
  { nome: "X-Burguer",        categoria: "Lanches",         preco: 18.00, quantidade_estoque: 60,  foto: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { nome: "X-Salada",         categoria: "Lanches",         preco: 19.50, quantidade_estoque: 50,  foto: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80" },
  { nome: "X-Bacon",          categoria: "Lanches",         preco: 22.00, quantidade_estoque: 45,  foto: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80" },
  { nome: "Hot Dog Simples",  categoria: "Lanches",         preco: 12.00, quantidade_estoque: 80,  foto: "https://images.unsplash.com/photo-1619740455993-9d622aad2d58?w=400&q=80" },
  { nome: "Batata Frita P",   categoria: "Acompanhamentos", preco:  9.00, quantidade_estoque: 100, foto: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80" },
  { nome: "Batata Frita G",   categoria: "Acompanhamentos", preco: 14.00, quantidade_estoque: 80,  foto: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80" },
  { nome: "Coca-Cola Lata",   categoria: "Bebidas",         preco:  6.00, quantidade_estoque: 120, foto: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80" },
  { nome: "Água Mineral",     categoria: "Bebidas",         preco:  3.50, quantidade_estoque: 150, foto: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80" },
  { nome: "Suco de Laranja",  categoria: "Bebidas",         preco:  8.00, quantidade_estoque: 60,  foto: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80" },
  { nome: "Milkshake",        categoria: "Bebidas",         preco: 14.00, quantidade_estoque: 40,  foto: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80" },
];

const FORMAS_PAGAMENTO = ["pix", "dinheiro", "credito", "debito", "mix"];

// ─── Utilitários ─────────────────────────────────────────────────────────────

function diasAtras(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(Math.floor(Math.random() * 8) + 11, Math.floor(Math.random() * 59), 0); // 11h–19h
  return d;
}

function escolher(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function entre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Seed principal ───────────────────────────────────────────────────────────

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("✔  Banco conectado\n");

  // ── 1. Atendentes ──────────────────────────────────────────────────────────
  console.log("── Atendentes ──────────────────────────────────────");
  const atendentesIds = [];

  for (const dados of ATENDENTES) {
    const [registro, criado] = await Atendente.findOrCreate({
      where: { login: dados.login },
      defaults: dados,
    });
    atendentesIds.push(registro.id_atendente);
    console.log(`  ${criado ? "✔ criado" : "→ já existe"}  ${dados.nome} (${dados.login})`);
  }

  // ── 2. Produtos ────────────────────────────────────────────────────────────
  console.log("\n── Produtos ─────────────────────────────────────────");
  const produtosRegistros = [];

  for (const dados of PRODUTOS) {
    const [registro, criado] = await Produto.findOrCreate({
      where: { nome: dados.nome },
      defaults: dados,
    });

    // Garante estoque abastecido e foto atualizada mesmo se o produto já existia
    if (!criado) {
      const updates = {};
      if (registro.quantidade_estoque < dados.quantidade_estoque) updates.quantidade_estoque = dados.quantidade_estoque;
      if (dados.foto && registro.foto !== dados.foto) updates.foto = dados.foto;
      if (Object.keys(updates).length > 0) {
        await registro.update({ ...updates, status: "ativo" });
        console.log(`  ↑ atualizado  ${dados.nome}`);
      } else {
        console.log(`  → já existe  ${dados.nome} (estoque: ${registro.quantidade_estoque})`);
      }
    } else {
      console.log(`  ✔ criado  ${dados.nome} (estoque: ${dados.quantidade_estoque})`);
    }

    produtosRegistros.push(registro);
  }

  // ── 3. Mesas ───────────────────────────────────────────────────────────────
  console.log("\n── Mesas ────────────────────────────────────────────");
  const mesasIds = [];

  for (let n = 1; n <= 8; n++) {
    const [mesa, criada] = await Mesa.findOrCreate({
      where: { numero_mesa: n },
      defaults: { numero_mesa: n, status: "livre" },
    });
    mesasIds.push(mesa.id_mesa);
    if (criada) console.log(`  ✔ Mesa ${n} criada`);
  }
  if (mesasIds.length) console.log(`  → ${mesasIds.length} mesas disponíveis`);

  // ── 4. Pedidos + Itens + Vendas ────────────────────────────────────────────
  console.log("\n── Pedidos / Vendas ─────────────────────────────────");

  // Distribui pedidos pelos últimos 30 dias (mais recentes têm mais pedidos)
  const diasDistribuicao = [
    0, 0, 1, 1, 2, 2, 3, 4, 5, 6,
    7, 8, 9, 10, 12, 14, 16, 18, 22, 27,
  ];

  let totalVendas = 0;

  for (const diasPassados of diasDistribuicao) {
    await sequelize.transaction(async (t) => {
      const idAtendente = escolher(atendentesIds);
      const temMesa     = Math.random() > 0.35; // 65% com mesa
      const idMesa      = temMesa ? escolher(mesasIds) : null;
      const dataHora    = diasAtras(diasPassados);
      const formaPgto   = escolher(FORMAS_PAGAMENTO);

      // Escolhe 2-4 produtos aleatórios para o pedido
      const produtosSelecionados = [...produtosRegistros]
        .sort(() => Math.random() - 0.5)
        .slice(0, entre(2, 4));

      // Cria pedido
      const pedido = await Pedido.create({
        id_atendente: idAtendente,
        id_mesa:      idMesa,
        status:       "pago",
        forma_pagamento: formaPgto,
        data_hora:    dataHora,
        total:        0,
      }, { transaction: t });

      // Cria itens e calcula total
      let total = 0;
      for (const produto of produtosSelecionados) {
        const quantidade     = entre(1, 3);
        const preco_unitario = parseFloat(produto.preco);
        const subtotal       = parseFloat((preco_unitario * quantidade).toFixed(2));
        total               += subtotal;

        await ItemPedido.create({
          id_pedido:     pedido.id_pedido,
          id_produto:    produto.id_produto,
          quantidade,
          preco_unitario,
          subtotal,
        }, { transaction: t });

        // Desconta estoque
        await produto.update(
          { quantidade_estoque: Math.max(0, produto.quantidade_estoque - quantidade) },
          { transaction: t }
        );
      }

      total = parseFloat(total.toFixed(2));
      await pedido.update({ total }, { transaction: t });

      // Cria venda
      await Venda.create({
        id_pedido:       pedido.id_pedido,
        forma_pagamento: formaPgto,
        valor_total:     total,
        data_hora:       dataHora,
      }, { transaction: t });

      totalVendas += total;
      const mesa = idMesa ? `Mesa ${mesasIds.indexOf(idMesa) + 1}` : "Para viagem";
      console.log(`  ✔ Pedido #${pedido.id_pedido}  ${mesa.padEnd(12)}  R$ ${total.toFixed(2).padStart(7)}  ${formaPgto}`);
    });
  }

  console.log("\n─────────────────────────────────────────────────────");
  console.log(`  Total gerado em vendas: R$ ${totalVendas.toFixed(2)}`);
  console.log("  Seed concluído com sucesso!\n");

  await sequelize.close();
}

seed().catch(err => {
  console.error("\n❌ Erro no seed:", err.message);
  process.exit(1);
});
