#!/usr/bin/env node
/**
 * setup-avaliador.js — Cria o usuário de avaliação e faz backup do estado demo
 *
 * Uso:
 *   node scripts/setup-avaliador.js
 *
 * Para ambiente local:
 *   BASE_URL=http://localhost:3000 GERENTE_LOGIN=admin GERENTE_SENHA=suasenha node scripts/setup-avaliador.js
 *
 * O script:
 *   1. Autentica como gerente
 *   2. Cria o atendente "avaliador" com papel gerente (se ainda não existir)
 *   3. Dispara um backup automático nomeado "demo_avaliacao"
 *   4. Exibe as credenciais prontas para compartilhar
 */

const https = require('https');
const http  = require('http');

const BASE_URL      = process.env.BASE_URL || 'https://projeto-aplicado-iii-foodtruck-system-production.up.railway.app';
const GERENTE_LOGIN = process.env.GERENTE_LOGIN || 'admin';
const GERENTE_SENHA = process.env.GERENTE_SENHA || '';
const BACKUP_TOKEN  = process.env.BACKUP_TOKEN  || '';

const AVALIADOR_LOGIN = 'avaliador';
const AVALIADOR_SENHA = 'Senai@2026';
const AVALIADOR_NOME  = 'Avaliador Demo';
const AVALIADOR_CPF   = '00000000000';

// ── utilitário de requisição ─────────────────────────────────────────────────

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url     = new URL(BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const lib     = isHttps ? https : http;

    const data = body ? JSON.stringify(body) : null;
    const opts  = {
      hostname: url.hostname,
      port:     url.port || (isHttps ? 443 : 80),
      path:     url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...headers,
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

// ── fluxo principal ──────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Food Truck System — Setup de Avaliação     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // 1. Login como gerente
  process.stdout.write('1. Autenticando como gerente... ');
  const auth = await request('POST', '/auth/login', { username: GERENTE_LOGIN, password: GERENTE_SENHA });
  if (!auth.body?.token) {
    console.log('FALHOU');
    console.error('   ✗ Verifique GERENTE_LOGIN e GERENTE_SENHA nas variáveis de ambiente.');
    process.exit(1);
  }
  const token = auth.body.token;
  const authHeader = { Authorization: `Bearer ${token}` };
  console.log('OK');

  // 2. Verificar se avaliador já existe
  process.stdout.write('2. Verificando usuário avaliador... ');
  const lista = await request('GET', '/atendentes', null, authHeader);
  const jaExiste = (lista.body || []).some(a => a.login === AVALIADOR_LOGIN);

  if (jaExiste) {
    console.log('já existe — mantendo');
  } else {
    // Criar avaliador
    const criado = await request('POST', '/atendentes', {
      nome:         AVALIADOR_NOME,
      login:        AVALIADOR_LOGIN,
      senha:        AVALIADOR_SENHA,
      cpf:          AVALIADOR_CPF,
      telefone:     '',
      tipo_usuario: 'gerente',
    }, authHeader);

    if (criado.status === 201) {
      console.log('criado com sucesso');
    } else {
      console.log('FALHOU');
      console.error('   ✗ Erro ao criar avaliador:', JSON.stringify(criado.body));
      process.exit(1);
    }
  }

  // 3. Criar backup do estado demo
  process.stdout.write('3. Criando backup do estado demo... ');
  if (!BACKUP_TOKEN) {
    console.log('pulado (BACKUP_TOKEN não definido)');
  } else {
    const bk = await request(
      'POST', '/backups',
      { nome: 'demo_avaliacao' },
      { ...authHeader, 'x-backup-token': BACKUP_TOKEN }
    );
    if (bk.status === 201 || bk.status === 200) {
      console.log('OK');
    } else {
      console.log('FALHOU (não crítico)');
      console.error('   ✗ Detalhe:', JSON.stringify(bk.body));
    }
  }

  // 4. Resultado
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║           CREDENCIAIS DE AVALIAÇÃO           ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  URL:   ${BASE_URL.padEnd(37)}║`);
  console.log(`║  Login: ${AVALIADOR_LOGIN.padEnd(37)}║`);
  console.log(`║  Senha: ${AVALIADOR_SENHA.padEnd(37)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Papel: Gerente (acesso completo)            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\nCompartilhe apenas a URL, o login e a senha acima.');
  console.log('Para restaurar os dados após avaliação, veja AVALIACAO.md\n');
}

main().catch(err => {
  console.error('\n✗ Erro inesperado:', err.message);
  process.exit(1);
});
