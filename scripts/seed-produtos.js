#!/usr/bin/env node
/**
 * seed-produtos.js — Popula o banco com cardápio de lanchonete
 *
 * Uso:
 *   node scripts/seed-produtos.js
 *
 * Por padrão usa a URL da Railway. Para testar localmente, passe a URL:
 *   BASE_URL=http://localhost:3000 node scripts/seed-produtos.js
 */

const https = require('https');
const http  = require('http');

const BASE_URL = process.env.BASE_URL
  || 'https://projeto-aplicado-iii-foodtruck-system-production.up.railway.app';

const GERENTE_LOGIN = process.env.GERENTE_LOGIN || 'admin';
const GERENTE_SENHA = process.env.GERENTE_SENHA || 'foodtruck2026';

// ── CARDÁPIO ────────────────────────────────────────────────────────────────────────────
const produtos = [
  // LANCHES
  { nome: 'X-Burguer Clássico',    categoria: 'Lanche',   preco: 18.00, quantidade_estoque: 50, descricao: 'Hambúrguer artesanal, queijo, alface, tomate e maionese especial' },
  { nome: 'X-Bacon',               categoria: 'Lanche',   preco: 22.00, quantidade_estoque: 40, descricao: 'Hambúrguer artesanal, bacon crocante, queijo cheddar e cebola caramelizada' },
  { nome: 'X-Frango',              categoria: 'Lanche',   preco: 17.00, quantidade_estoque: 40, descricao: 'Filé de frango grelhado, queijo, alface, tomate e molho de mostarda e mel' },
  { nome: 'X-Tudo',                categoria: 'Lanche',   preco: 26.00, quantidade_estoque: 30, descricao: 'Hambúrguer duplo, bacon, ovo, queijo, alface, tomate e maionese da casa' },
  { nome: 'Hot-Dog Tradicional',   categoria: 'Lanche',   preco: 12.00, quantidade_estoque: 60, descricao: 'Salsicha, purê de batata, vinagrete, batata palha e molhos' },
  { nome: 'Hot-Dog Especial',      categoria: 'Lanche',   preco: 15.00, quantidade_estoque: 50, descricao: 'Salsicha calabresa, purê, queijo derretido, batata palha e mostarda' },
  { nome: 'Misto Quente',          categoria: 'Lanche',   preco: 9.00,  quantidade_estoque: 80, descricao: 'Pão de forma, queijo e presunto grelhados' },
  { nome: 'Bauru',                 categoria: 'Lanche',   preco: 14.00, quantidade_estoque: 40, descricao: 'Rosbife, queijo derretido, tomate e orégano no pão francês' },

  // BEBIDAS
  { nome: 'Coca-Cola Lata',        categoria: 'Bebida',   preco: 6.00,  quantidade_estoque: 100, descricao: 'Coca-Cola lata 350ml gelada' },
  { nome: 'Guaraná Antarctica',    categoria: 'Bebida',   preco: 6.00,  quantidade_estoque: 80,  descricao: 'Guaraná lata 350ml gelado' },
  { nome: 'Suco de Laranja Natural', categoria: 'Bebida', preco: 9.00,  quantidade_estoque: 30,  descricao: 'Suco de laranja espremido na hora 400ml' },
  { nome: 'Suco de Maracujá',      categoria: 'Bebida',   preco: 9.00,  quantidade_estoque: 25,  descricao: 'Suco de maracujá natural com ou sem açúcar 400ml' },
  { nome: 'Água Mineral',          categoria: 'Bebida',   preco: 4.00,  quantidade_estoque: 120, descricao: 'Água mineral sem gás 500ml' },
  { nome: 'Água com Gás',          categoria: 'Bebida',   preco: 5.00,  quantidade_estoque: 60,  descricao: 'Água mineral com gás 500ml' },
  { nome: 'Café Expresso',         categoria: 'Bebida',   preco: 5.00,  quantidade_estoque: 50,  descricao: 'Café expresso curto ou longo' },
  { nome: 'Milk-shake Chocolate',  categoria: 'Bebida',   preco: 14.00, quantidade_estoque: 20,  descricao: 'Milk-shake cremoso de chocolate 400ml' },

  // SOBREMESAS
  { nome: 'Brownie de Chocolate',  categoria: 'Sobremesa', preco: 8.00,  quantidade_estoque: 30, descricao: 'Brownie caseiro quentinho com calda de chocolate' },
  { nome: 'Pudim de Leite',        categoria: 'Sobremesa', preco: 7.00,  quantidade_estoque: 25, descricao: 'Fatia de pudim de leite condensado com calda de caramelo' },
  { nome: 'Sorvete 2 Bolas',       categoria: 'Sobremesa', preco: 9.00,  quantidade_estoque: 40, descricao: 'Duas bolas de sorvete à escolha: chocolate, morango ou baunilha' },
  { nome: 'Churros com Doce de Leite', categoria: 'Sobremesa', preco: 10.00, quantidade_estoque: 35, descricao: 'Churros frito crocante recheado com doce de leite e açúcar canela' },

  // PORÇÕES / ACOMPANHAMENTOS
  { nome: 'Batata Frita P',        categoria: 'Porcao',   preco: 12.00, quantidade_estoque: 60, descricao: 'Porção pequena de batata frita crocante com sal e ketchup' },
  { nome: 'Batata Frita M',        categoria: 'Porcao',   preco: 16.00, quantidade_estoque: 50, descricao: 'Porção média de batata frita com sal e ketchup' },
  { nome: 'Batata Frita G',        categoria: 'Porcao',   preco: 20.00, quantidade_estoque: 40, descricao: 'Porção grande de batata frita para compartilhar' },
  { nome: 'Onion Rings',           categoria: 'Porcao',   preco: 15.00, quantidade_estoque: 30, descricao: 'Anéis de cebola empanados e fritos, crocantes por fora' },
];

// ── HTTP helper ────────────────────────────────────────────────────────────────────────────
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url  = new URL(BASE_URL + path);
    const lib  = url.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname + url.search,
      method,
      headers: {
        'Content-Type':  'application/json',
        ...(data   ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token  ? { 'Authorization': `Bearer ${token}` }       : {}),
      },
    };
    const req = lib.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── MESAS ────────────────────────────────────────────────────────────────────────────────
const mesas = Array.from({ length: 10 }, (_, i) => ({ numero_mesa: i + 1, status: 'livre' }));

// ── MAIN ─────────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚚 Food Truck System — Seed de Dados`);
  console.log(`📡 API: ${BASE_URL}`);
  console.log('─'.repeat(50));

  // 1. Login
  console.log('\n🔑 Fazendo login como gerente...');
  const loginRes = await request('POST', '/auth/login', { username: GERENTE_LOGIN, password: GERENTE_SENHA });
  if (!loginRes.body?.success || !loginRes.body?.token) {
    console.error('❌ Login falhou:', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.token;
  console.log('✅ Login OK');

  // 2. Verifica produtos existentes
  const listRes = await request('GET', '/produtos', null, token);
  const existentes = Array.isArray(listRes.body) ? listRes.body : (listRes.body?.data || []);
  const existentesNomes = new Set(existentes.map(p => p.nome?.toLowerCase()));
  console.log(`\nℹ️  Produtos já cadastrados: ${existentes.length}`);

  // 3. Insere produtos novos
  let criados = 0, pulados = 0, erros = 0;
  console.log('\n📦 Inserindo produtos...\n');

  for (const prod of produtos) {
    if (existentesNomes.has(prod.nome.toLowerCase())) {
      console.log(`   ⏭  [PULADO]  ${prod.nome}`);
      pulados++;
      continue;
    }
    const res = await request('POST', '/produtos', prod, token);
    if (res.status === 201 || res.status === 200) {
      console.log(`   ✅ [CRIADO]  ${prod.nome}  (R$ ${prod.preco.toFixed(2)})`);
      criados++;
    } else {
      console.log(`   ❌ [ERRO]    ${prod.nome} — ${JSON.stringify(res.body)}`);
      erros++;
    }
  }

  // 4. Seed mesas
  console.log('\n🪑 Verificando mesas...');
  const mesasRes = await request('GET', '/mesas', null, token);
  const mesasExist = Array.isArray(mesasRes.body) ? mesasRes.body : [];
  const mesasExistNums = new Set(mesasExist.map(m => m.numero_mesa));
  let mesasCriadas = 0;
  for (const mesa of mesas) {
    if (mesasExistNums.has(mesa.numero_mesa)) continue;
    const r = await request('POST', '/mesas', mesa, token);
    if (r.status === 201 || r.status === 200) mesasCriadas++;
  }
  console.log(`   Mesas já existentes: ${mesasExist.length} | Criadas agora: ${mesasCriadas}`);

  console.log('\n─'.repeat(50));
  console.log(`\n📊 Resumo:`);
  console.log(`   Produtos criados: ${criados}`);
  console.log(`   Produtos pulados (já existiam): ${pulados}`);
  console.log(`   Mesas criadas: ${mesasCriadas}`);
  console.log(`   Erros: ${erros}`);
  console.log(`\n✅ Seed concluído!\n`);
}

main().catch(err => { console.error('\n❌ Erro fatal:', err.message); process.exit(1); });
