(async () => {
  const API = 'http://localhost:3000';

  // Minimal fetch wrapper for Node (works on Node 18+)
  if (typeof fetch === 'undefined') {
    console.error('fetch is not available in this Node runtime. Aborting test.');
    process.exit(1);
  }

  try {
    console.log('Fetching atendentes...');
    const r1 = await fetch(`${API}/atendentes`);
    if (!r1.ok) throw new Error(`GET /atendentes failed: ${r1.status}`);
    const atendentes = await r1.json();
    if (!Array.isArray(atendentes) || atendentes.length === 0) {
      console.error('Nenhum atendente disponível para o teste. Crie um atendente antes de rodar o teste.');
      process.exit(1);
    }

    const idAtendente = atendentes[0].id_atendente;
    console.log('Usando atendente id:', idAtendente);

    const payload = {
      id_mesa: null,
      id_atendente: idAtendente,
      status: 'aberto',
      total: 5.00,
      observacoes: 'Teste automatizado - verificar id_atendente'
    };

    console.log('Criando pedido de teste...');
    const r2 = await fetch(`${API}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const created = await r2.json();
    console.log('Resposta POST /pedidos:', r2.status, JSON.stringify(created));

    console.log('Buscando lista de pedidos para verificar persistência...');
    const r3 = await fetch(`${API}/pedidos`);
    const pedidos = await r3.json();

    const found = pedidos.find(p => p.observacoes && p.observacoes.includes('Teste automatizado'));
    if (!found) {
      console.error('Pedido de teste não encontrado na listagem.');
      console.log('Total pedidos retornados:', pedidos.length);
      process.exit(2);
    }

    console.log('Pedido encontrado. Verifique id_atendente abaixo:');
    console.log(JSON.stringify(found, null, 2));

    if (found.id_atendente == idAtendente) {
      console.log('SUCESSO: id_atendente persistido corretamente.');
      process.exit(0);
    } else {
      console.error(`FALHA: id_atendente esperado=${idAtendente} mas encontrado=${found.id_atendente}`);
      process.exit(3);
    }

  } catch (err) {
    console.error('Erro durante o teste:', err);
    process.exit(4);
  }
})();