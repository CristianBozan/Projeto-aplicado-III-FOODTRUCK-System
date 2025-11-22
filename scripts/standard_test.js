/*
  Standardized test runner for basic E2E checks (no test framework required).
  - Requires Node 18+ (global fetch available).
  - Usage: node scripts/standard_test.js
  Exit codes:
    0 = all tests passed
    1 = environment (fetch) not available
    2 = no atendentes found
    3 = create pedido failed
    4 = pedido not found or id_atendente mismatch
    5 = unexpected error
*/

(async () => {
  const API = 'http://localhost:3000';
  const results = [];

  if (typeof fetch === 'undefined') {
    console.error('ERROR: fetch is not available in this Node runtime. Use Node 18+ or add a fetch polyfill.');
    process.exit(1);
  }

  try {
    console.log('TEST 1: GET /atendentes — verificar existência de atendentes');
    const rA = await fetch(`${API}/atendentes`);
    if (!rA.ok) {
      console.error(`FAIL: GET /atendentes returned ${rA.status}`);
      process.exit(5);
    }
    const atendentes = await rA.json();
    if (!Array.isArray(atendentes) || atendentes.length === 0) {
      console.error('FAIL: Nenhum atendente encontrado. Crie ao menos um atendente antes de rodar o teste.');
      process.exit(2);
    }
    console.log(`PASS: Encontrados ${atendentes.length} atendente(s).`);
    results.push({ test: 'atendentes_exist', ok: true, count: atendentes.length });

    const idAtendente = atendentes[0].id_atendente;

    console.log('\nTEST 2: POST /pedidos — criar pedido com id_atendente');
    const payload = {
      id_mesa: null,
      id_atendente: idAtendente,
      status: 'aberto',
      total: 9.5,
      observacoes: `Teste padronizado - ${new Date().toISOString()}`
    };

    const rCreate = await fetch(`${API}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const createJson = await rCreate.json().catch(() => null);
    if (rCreate.status !== 201) {
      console.error('FAIL: POST /pedidos não retornou 201. Status:', rCreate.status, 'Body:', createJson);
      process.exit(3);
    }

    // extract created id if possible
    const createdId = createJson?.novo?.id_pedido || createJson?.id_pedido || (createJson?.novo && createJson.novo.id_pedido) || null;
    console.log('PASS: Pedido criado (status 201). Resposta curta:', JSON.stringify(createJson).slice(0,200));
    results.push({ test: 'create_pedido', ok: true, responseStatus: rCreate.status, createdId });

    console.log('\nTEST 3: GET /pedidos — verificar persistência e id_atendente');
    const rList = await fetch(`${API}/pedidos`);
    if (!rList.ok) {
      console.error('FAIL: GET /pedidos returned', rList.status);
      process.exit(5);
    }
    const pedidos = await rList.json();
    const found = pedidos.find(p => p.observacoes && p.observacoes.includes('Teste padronizado'));
    if (!found) {
      console.error('FAIL: Pedido criado não encontrado na listagem.');
      process.exit(4);
    }

    console.log('Pedido encontrado:', JSON.stringify({ id_pedido: found.id_pedido, id_atendente: found.id_atendente, observacoes: found.observacoes }));
    if (Number(found.id_atendente) === Number(idAtendente)) {
      console.log('PASS: id_atendente persistido corretamente.');
      results.push({ test: 'verify_id_atendente', ok: true, expected: idAtendente, found: found.id_atendente });
      console.log('\nRESULT: TODOS OS TESTES PASSARAM ✅');
      process.exit(0);
    } else {
      console.error(`FAIL: id_atendente mismatch. esperado=${idAtendente} encontrado=${found.id_atendente}`);
      process.exit(4);
    }

  } catch (err) {
    console.error('ERROR unexpected:', err);
    process.exit(5);
  }
})();