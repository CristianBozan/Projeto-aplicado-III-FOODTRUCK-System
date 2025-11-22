const API_URL = process.env.API_URL || 'http://localhost:3000';

async function main(){
  try{
    console.log('Teste: criar pedido aberto com atendente e depois finalizar (sem reenviar atendente)');
    // ajuste id_atendente se necessário
    const payload = {
      id_mesa: null,
      id_atendente: 1,
      status: 'aberto',
      total: 12.5,
      observacoes: 'Teste preserve atendente'
    };

    const createRes = await fetch(`${API_URL}/pedidos`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    const createJson = await createRes.json();
    if(!createRes.ok){ console.error('Erro criando pedido:', createJson); process.exit(2); }
    console.log('Resposta criação:', createJson);
    const pedidoId = createJson?.novo?.id_pedido || createJson?.id_pedido;
    if(!pedidoId){ console.error('Não consegui extrair id do pedido'); process.exit(3); }

    // agora atualiza somente status/forma_pagamento (sem id_atendente)
    const updRes = await fetch(`${API_URL}/pedidos/${pedidoId}`,{
      method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'finalizado', forma_pagamento:'pix' })
    });
    const updJson = await updRes.json();
    if(!updRes.ok){ console.error('Erro atualizando pedido:', updJson); process.exit(4); }
    console.log('Resposta update:', updJson);

    // busca pedido
    const getRes = await fetch(`${API_URL}/pedidos/${pedidoId}`);
    const getJson = await getRes.json();
    console.log('Pedido atual:', getJson);

    if(getJson.id_atendente){
      console.log('OK: id_atendente preservado =', getJson.id_atendente);
      process.exit(0);
    } else {
      console.error('FALHA: id_atendente foi removido');
      process.exit(5);
    }

  }catch(err){
    console.error('Erro no teste:', err); process.exit(1);
  }
}

main();
