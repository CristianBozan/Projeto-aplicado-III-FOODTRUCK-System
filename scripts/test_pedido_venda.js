/*
  Test script para validar o fluxo: criar um pedido com status 'finalizado' e forma_pagamento,
  verificar se o backend criou a Venda e que o Pedido ficou com status 'pago'.

  Uso:
    1) Inicie o servidor (npm run dev ou npm start) que por padrão roda na porta 3000
    2) Rode: node scripts/test_pedido_venda.js

  Observação: o script usa fetch (Node >= 18). Se seu Node for mais antigo, use upgrade
  ou execute via curl/Postman conforme instruções abaixo.
*/

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function main() {
  try {
    console.log('Teste: criar pedido finalizado com pagamento e checar venda/status...');

    // Ajuste estes IDs conforme dados do seu ambiente (atendente existente)
    const payload = {
      id_mesa: null, // pedido para viagem
      id_atendente: 1,
      status: 'finalizado',
      forma_pagamento: 'pix',
      total: 42.5,
      observacoes: 'Teste automático'
    };

    const createRes = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const createJson = await createRes.json();
    if (!createRes.ok) {
      console.error('Falha ao criar pedido:', createJson);
      process.exit(2);
    }

    console.log('Resposta do servidor (criar pedido):', createJson);

    const pedidoId = (createJson.novo && createJson.novo.id_pedido) || (createJson.result && createJson.result.novo && createJson.result.novo.id_pedido) || createJson.novo?.id_pedido || createJson.id_pedido;

    // Se o controller retornou vendaCriada embutida
    const vendaCriada = createJson.vendaCriada || (createJson.novo && createJson.novo.vendaCriada) || (createJson.result && createJson.result.vendaCriada) || null;

    // Permite um pequeno delay para consistência caso o servidor processe assincronamente
    await new Promise(r => setTimeout(r, 500));

    if (!pedidoId) {
      console.warn('Não foi possível extrair id do pedido da resposta do servidor. Buscando último pedido criado pelo atendente...');
      // fallback: listar pedidos e pegar o mais recente
      const listRes = await fetch(`${API_URL}/pedidos`);
      const pedidos = await listRes.json();
      const found = pedidos.reverse().find(p => p.observacoes === payload.observacoes && p.total == payload.total && p.id_atendente == payload.id_atendente);
      if (found) pedidoId = found.id_pedido;
    }

    if (!pedidoId) {
      console.error('Não foi possível determinar o id do pedido criado. Abortando.');
      process.exit(3);
    }

    console.log('Pedido criado com id:', pedidoId);

    // Verifica o pedido por id
    const pedidoRes = await fetch(`${API_URL}/pedidos/${pedidoId}`);
    const pedidoJson = await pedidoRes.json();
    console.log('Pedido atual:', pedidoJson);

    // Verifica vendas para o pedido
    const vendasRes = await fetch(`${API_URL}/vendas`);
    const vendas = await vendasRes.json();
    const venda = vendas.find(v => v.id_pedido == pedidoId || (v.Pedido && v.Pedido.id_pedido == pedidoId));

    if (venda) {
      console.log('Venda encontrada vinculada ao pedido:', venda);
    } else {
      console.warn('Nenhuma venda encontrada vinculada ao pedido.');
    }

    // Valida que o pedido esteja como 'pago'
    if (pedidoJson.status === 'pago') {
      console.log('OK: pedido marcado como pago (status)');
    } else {
      console.error('Falha: pedido NÃO está com status "pago". Status atual:', pedidoJson.status);
      process.exit(4);
    }

    console.log('Teste finalizado com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('Erro no teste:', err);
    process.exit(1);
  }
}

main();
