// Configuração da API
const API_URL = "http://localhost:3000";

// Carrinho de compras global
 
let carrinho = [];
let chartVendasDia = null;
let chartPagamento = null;
let chartAtendente = null;

// Navegação entre seções
document.addEventListener("DOMContentLoaded", () => {
  // Carrega os dados iniciais
  console.log('app.js DOMContentLoaded - initializing UI');
  loadDashboard();
  
  // Event listeners para navegação
    document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.currentTarget || link;
      console.log('nav click:', target.getAttribute('data-section'));
      
      // Remove active de todos
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
      
      // Adiciona active no clicado
  target.classList.add("active");
  const sectionId = target.getAttribute("data-section");
      const sectionEl = document.getElementById(sectionId);
      if (sectionEl) {
        sectionEl.classList.add("active");
      } else {
        console.warn('Seção não encontrada:', sectionId);
      }
      
      // Carrega dados da seção
      loadSectionData(sectionId);
    });
  });
  // conecta handlers dos botões de sincronização e listagem de backups, se existirem
  try {
    const syncBtn = document.getElementById('syncBackupBtn');
    if (syncBtn) syncBtn.addEventListener('click', syncBackup);
    const openBackupsBtn = document.getElementById('openBackupsBtn');
    if (openBackupsBtn) openBackupsBtn.addEventListener('click', openBackupsModal);
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('loggedIn');
      window.location = '/login.html';
    });
    // salvar seleção do carrinho ao mudar selects
    try {
      const cm = document.getElementById('carrinhoMesa');
      const ca = document.getElementById('carrinhoAtendente');
      const cp = document.getElementById('carrinhoPagamento');
      if (cm) cm.addEventListener('change', () => saveCarrinhoSelections());
      if (ca) ca.addEventListener('change', () => saveCarrinhoSelections());
      if (cp) cp.addEventListener('change', () => saveCarrinhoSelections());
    } catch(e) {}
  } catch (err) {
    console.warn('Não foi possível conectar botões de backup', err);
  }
});

// Redireciona para tela de login se não autenticado
if (!window.location.pathname.endsWith('/login.html')) {
  try {
    if (!localStorage.getItem('loggedIn')) {
      window.location = '/login.html';
    }
  } catch (err) {
    console.warn('Erro ao verificar estado de autenticação', err);
  }
}

// Carrega dados conforme a seção
function loadSectionData(section) {
  switch(section) {
    case "dashboard":
      loadDashboard();
      break;
    case "atendentes":
      loadAtendentes();
      break;
    case "produtos":
      loadProdutos();
      break;
    case "mesas":
      loadMesas();
      break;
    case "pedidos":
      loadPedidos();
      break;
    case "vendas":
      loadVendas();
      break;
  }
}

// Função para disparar sincronização / backup via endpoint administrativo
async function syncBackup() {
  const btn = document.getElementById('syncBackupBtn');
  if (!btn) return;
  // solicita nome do backup ao usuário
  const nome = prompt('Informe um nome para o backup:');
  if (nome === null) return; // usuário cancelou

  const originalText = btn.textContent;
  try {
    btn.disabled = true;
    btn.textContent = '⏳ Criando backup...';

    const resp = await fetch(`${API_URL}/backups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome }) });
    if (!resp.ok) {
      const err = await resp.json().catch(() => null);
      showAlert(err?.message || 'Erro ao executar backup', 'error');
      return;
    }
    const result = await resp.json().catch(() => null);
    showAlert(result?.message || 'Backup criado com sucesso', 'success');
    // atualizar lista de backups se modal aberto
    try { fetchBackups(); } catch(e){}
  } catch (err) {
    console.error('Erro ao criar backup:', err);
    showAlert(err?.message || 'Erro ao criar backup', 'error');
  } finally {
    btn.disabled = false;
    try { btn.textContent = originalText; } catch(e) {}
  }
}

// ================= BACKUPS (Frontend) =================
function openBackupsModal() {
  const modal = document.getElementById('backupsModal');
  if (!modal) return;
  modal.classList.add('active');
  fetchBackups();
}

// Recupera token de backup armazenado na sessão (sessionStorage) ou solicita via prompt
async function getBackupAuthHeaders() {
  try {
    let token = sessionStorage.getItem('backupToken');
    if (!token) {
      token = prompt('Informe o token de segurança para operações de backup (será salvo nesta sessão):');
      if (token === null) return null; // usuário cancelou
      token = String(token).trim();
      if (token.length === 0) return null;
      sessionStorage.setItem('backupToken', token);
    }
    return { 'x-backup-token': token };
  } catch (err) {
    return null;
  }
}

async function fetchBackups() {
  const loading = document.getElementById('loadingBackups');
  const tbody = document.getElementById('backupsTableBody');
  if (loading) loading.style.display = 'block';
  if (tbody) tbody.innerHTML = '';
  try {
    const authHeaders = await getBackupAuthHeaders();
    const headers = authHeaders ? authHeaders : {};
    const resp = await fetch(`${API_URL}/backups`, { headers });
    if (!resp.ok) {
      const err = await resp.json().catch(() => null);
      showAlert(err?.message || 'Erro ao listar backups', 'error');
      return;
    }
    const data = await resp.json();
    renderBackupsList(data.backups || []);
  } catch (err) {
    console.error('Erro ao buscar backups:', err);
    showAlert('Erro ao buscar backups', 'error');
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

function renderBackupsList(list) {
  const tbody = document.getElementById('backupsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#999; padding:1rem;">Nenhum backup encontrado</td></tr>';
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');
    const mtime = item.data_hora ? new Date(item.data_hora).toLocaleString('pt-BR') : '-';
    tr.innerHTML = `
      <td>${escapeHtml(item.nome)}</td>
      <td>-</td>
      <td>${mtime}</td>
      <td class="actions">
        <button class="action-btn action-excel" onclick="downloadExcel(${item.id})">📄 Excel</button>
        <button class="action-btn action-view" onclick="downloadBackup(${item.id})">⬇️ Baixar</button>
        <button class="action-btn" onclick="viewBackup(${item.id})">👁️ Visualizar</button>
        <button class="action-btn action-restore" onclick="restoreBackup(${item.id})">♻️ Restaurar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function downloadBackup(id) {
  try {
    let url = `${API_URL}/backups/${id}/download`;
    const token = sessionStorage.getItem('backupToken');
    if (token) url += `?token=${encodeURIComponent(token)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error('Erro ao iniciar download do backup:', err);
    showAlert('Erro ao iniciar download', 'error');
  }
}

function downloadExcel(id) {
  try {
    let url = `${API_URL}/backups/${id}/excel`;
    const token = sessionStorage.getItem('backupToken');
    if (token) url += `?token=${encodeURIComponent(token)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error('Erro ao iniciar download Excel:', err);
    showAlert('Erro ao baixar Excel', 'error');
  }
}

async function viewBackup(id) {
  try {
    const headers = await getBackupAuthHeaders();
    const opts = headers ? { headers } : {};
    const resp = await fetch(`${API_URL}/backups/${id}`, opts);
    if (!resp.ok) {
      const err = await resp.json().catch(()=>null);
      showAlert(err?.message || 'Erro ao buscar backup', 'error');
      return;
    }
    const data = await resp.json();
    // abre janela com JSON formatado
    const w = window.open('', '_blank');
    w.document.write('<pre>' + escapeHtml(JSON.stringify(data.conteudo, null, 2)) + '</pre>');
    w.document.title = data.nome || 'Backup';
  } catch (err) {
    console.error('Erro ao visualizar backup:', err);
    showAlert('Erro ao visualizar backup', 'error');
  }
}

async function restoreBackup(id) {
  try {
    const modeInput = prompt('Digite o modo de restauração: "SAFE" para restaurar apenas registros ausentes, "FORCE" para sobrescrever tudo (DESTRUTIVO).', 'SAFE');
    if (modeInput === null) return; // cancel
    const mode = String(modeInput).toLowerCase() === 'force' ? 'force' : 'safe';

    let confirmMsg = mode === 'force' ? 'Restauração FORÇADA irá apagar pedidos, itens e vendas atuais e recriar a partir do backup. Deseja continuar?' : 'Restauração segura irá apenas inserir registros ausentes. Deseja continuar?';
    if (!confirm(confirmMsg)) return;

    const headers = await getBackupAuthHeaders();
    const opts = { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}), body: JSON.stringify({ mode }) };
    const resp = await fetch(`${API_URL}/backups/${id}/restore`, opts);
    if (!resp.ok) {
      const err = await resp.json().catch(()=>null);
      showAlert(err?.message || 'Erro ao restaurar backup', 'error');
      return;
    }
    const data = await resp.json();
    showAlert(data?.message || 'Restauração executada', 'success');
    console.log('Resultado restauração:', data);
  } catch (err) {
    console.error('Erro ao restaurar backup:', err);
    showAlert('Erro ao restaurar backup', 'error');
  }
}

function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// Renderiza a tabela de pedidos a partir do cache aplicando filtros e ordenação
function renderPedidosFromCache() {
  const tbody = document.getElementById('pedidoTableBody');
  const loading = document.getElementById('loadingPedidos');
  if (!tbody) return;
  tbody.innerHTML = '';

  const pedidos = (window.cachedPedidos || []).slice();

  // Aplica filtro
  const statusFilterEl = document.getElementById('pedidoFilterStatus');
  const statusFilter = statusFilterEl ? statusFilterEl.value : 'all';
  let filtered = pedidos.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  // Aplica ordenação
  const sortEl = document.getElementById('pedidoSortBy');
  const sortBy = sortEl ? sortEl.value : 'data_desc';
  filtered.sort((a, b) => {
    try {
      if (sortBy.startsWith('data')) {
        const da = new Date(a.data_hora).getTime();
        const db = new Date(b.data_hora).getTime();
        return sortBy.endsWith('_asc') ? da - db : db - da;
      }
      if (sortBy.startsWith('total')) {
        const ta = parseFloat(a.total) || 0;
        const tb = parseFloat(b.total) || 0;
        return sortBy.endsWith('_asc') ? ta - tb : tb - ta;
      }
      if (sortBy.startsWith('status')) {
        // Ordem personalizada de status (do mais "prioritário" ao menos): aberto, finalizado, pago, cancelado
        const order = ['aberto', 'finalizado', 'pago', 'cancelado'];
        const sa = (a.status || '').toLowerCase();
        const sb = (b.status || '').toLowerCase();
        const ia = order.indexOf(sa);
        const ib = order.indexOf(sb);
        // Se ambos tem índice válido, compare pelos índices
        if (ia !== -1 && ib !== -1) {
          return sortBy.endsWith('_asc') ? ia - ib : ib - ia;
        }
        // Se um dos status não está na ordem conhecida, fallback para comparação alfabética
        return sortBy.endsWith('_asc') ? sa.localeCompare(sb) : sb.localeCompare(sa);
      }
      if (sortBy.startsWith('id')) {
        const ia = parseInt(a.id_pedido) || 0;
        const ib = parseInt(b.id_pedido) || 0;
        return sortBy.endsWith('_asc') ? ia - ib : ib - ia;
      }
    } catch (err) {
      return 0;
    }
    return 0;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#999;">Nenhum pedido encontrado</td></tr>';
    return;
  }

  filtered.forEach(pedido => {
    const tr = document.createElement('tr');
    const dataHora = new Date(pedido.data_hora).toLocaleString('pt-BR');
    const mesaLabel = pedido.id_mesa ? `Mesa ${pedido.Mesa?.numero_mesa}` : 'Para Viagem';
    tr.innerHTML = `
      <td>${pedido.id_pedido}</td>
      <td>${dataHora}</td>
      <td>${mesaLabel}</td>
      <td>${pedido.Atendente?.nome || '-'}</td>
      <td><span class="status-badge status-${pedido.status}">${pedido.status}</span></td>
      <td>${pedido.forma_pagamento || '-'}</td>
      <td>R$ ${parseFloat(pedido.total).toFixed(2)}</td>
      <td class="actions">
        <button class="action-btn action-edit" onclick="editPedido(${pedido.id_pedido})">✏️ Editar</button>
        <button class="action-btn action-success" onclick="openFinalizarModal(${pedido.id_pedido})">✅ Finalizar</button>
        <button class="action-btn action-delete" onclick="deletePedido(${pedido.id_pedido})">🗑️ Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Atualiza o badge de Vendas com a contagem de pedidos com status 'aberto'
function updateVendasBadge() {
  const badge = document.getElementById('vendasBadge');
  if (!badge) return;
  const pedidos = window.cachedPedidos || [];
  const count = pedidos.filter(p => p.status === 'aberto').length;
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    badge.textContent = '0';
    badge.classList.add('hidden');
  }
}

// Finaliza um pedido a partir da lista de pedidos (pede forma de pagamento e dispara atualização)
async function finalizarPedidoList(id) {
  // Deprecated: agora usamos modal de finalização (openFinalizarModal)
}

// ========== ALERTAS ==========
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} show`;
  alert.textContent = message;
  
  alertContainer.innerHTML = "";
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

// ========== MODAIS ==========
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Fecha modal ao clicar fora
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});

// Mostra modal simples listando itens criados após criação do pedido
function showItensCriadosModal(itens, pedidoId = null) {
  try {
    const modal = document.createElement('div');
    modal.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;';
    modal.id = 'itensCriadosModalTemp';

    const rows = itens.map(it => {
      const idItem = it.id_item || it.id || '';
      const idProd = it.id_produto || '';
      const qtd = it.quantidade || 0;
      const subtotal = parseFloat(it.subtotal || (it.preco_unitario * qtd) || 0).toFixed(2);
      return `<tr style="border-bottom:1px solid #eee"><td style="padding:8px">${escapeHtml(String(idItem))}</td><td style="padding:8px">${escapeHtml(String(idProd))}</td><td style="padding:8px">${escapeHtml(String(qtd))}</td><td style="padding:8px">R$ ${subtotal}</td></tr>`;
    }).join('');

    modal.innerHTML = `
      <div style="background:#fff;border-radius:8px;max-width:760px;width:100%;padding:1rem;max-height:80vh;overflow:auto;box-shadow:0 8px 24px rgba(0,0,0,0.2)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
          <h3 style="margin:0;font-size:1.1rem">Itens criados${pedidoId ? ' para Pedido #' + escapeHtml(String(pedidoId)) : ''}</h3>
          <button id="fecharItensCriadosTemp" class="btn" style="background:#d92b2b;color:#fff;border:none;padding:6px 10px;border-radius:4px">Fechar</button>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="text-align:left;color:#666"><th style="padding:8px">ID Item</th><th style="padding:8px">ID Produto</th><th style="padding:8px">Quantidade</th><th style="padding:8px">Subtotal</th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('fecharItensCriadosTemp').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  } catch (err) {
    console.warn('Erro ao mostrar modal de itens criados', err);
  }
}

// ========== DASHBOARD ==========
async function loadDashboard() {
  try {
    // Resumo geral
    const resumo = await fetch(`${API_URL}/relatorios/resumo`).then(r => r.json());
    document.getElementById("statVendas").textContent = resumo.quantidade_vendas || 0;
    document.getElementById("statFaturamento").textContent = `R$ ${parseFloat(resumo.faturamento_total || 0).toFixed(2)}`;
    document.getElementById("statTicket").textContent = `R$ ${parseFloat(resumo.ticket_medio || 0).toFixed(2)}`;

    // Faturamento por dia - usa filtros de período se aplicados
    // Inicializa controles de período (se ainda não inicializados)
    try {
      initPeriodoControls();
    } catch(e) {}

    const periodQuery = buildPeriodoQuery();
    // busca vendas por dia e normaliza vários possíveis formatos de resposta do backend
    const vendasDiaRaw = await fetch(`${API_URL}/relatorios/vendas-por-dia${periodQuery}`).then(r => r.json());
    const vendasDia = Array.isArray(vendasDiaRaw) ? vendasDiaRaw : (vendasDiaRaw && vendasDiaRaw.data ? vendasDiaRaw.data : []);

    const normalized = (vendasDia || []).map(item => {
      // tenta extrair campo 'data' e 'total_vendas' de várias formas
      let dataVal = null;
      let totalVal = null;

      try {
        if (item == null) return { data: null, total_vendas: 0 };
        if (typeof item === 'object') {
          // Sequelize instances often stringify to objects with dataValues or support .get()
          if (item.data !== undefined) dataVal = item.data;
          if (item.total_vendas !== undefined) totalVal = item.total_vendas;
          if (!dataVal && item.dataValues && item.dataValues.data !== undefined) dataVal = item.dataValues.data;
          if (!totalVal && item.dataValues && item.dataValues.total_vendas !== undefined) totalVal = item.dataValues.total_vendas;
          if (!dataVal && item.get && typeof item.get === 'function') {
            try { dataVal = item.get('data'); } catch(e) {}
            try { totalVal = totalVal || item.get('total_vendas'); } catch(e) {}
          }
          // fallback to data_hora or valor_total (caso o controller retorne outros nomes)
          if (!dataVal && (item.data_hora || (item.dataValues && item.dataValues.data_hora))) dataVal = item.data_hora || item.dataValues.data_hora;
          if (!totalVal && (item.valor_total || (item.dataValues && item.dataValues.valor_total))) totalVal = item.valor_total || item.dataValues.valor_total;
        }
      } catch (err) {
        console.warn('Erro normalizando item vendasDia', err, item);
      }

      // Garantir que dataVal seja uma string no formato YYYY-MM-DD ou Date
      let dateObj = null;
      if (dataVal instanceof Date) dateObj = dataVal;
      else if (typeof dataVal === 'string') {
        // Alguns backends retornam '2025-11-21' sem timezone — Date(...) será suficiente
        dateObj = new Date(dataVal);
        if (isNaN(dateObj)) {
          // tentar extrair primeiro 10 chars
          const s = dataVal.slice(0,10);
          dateObj = new Date(s);
        }
      }

      return { data: dateObj, total_vendas: parseFloat(totalVal || 0) };
    });

    const labels = normalized.map(d => d.data ? d.data.toLocaleDateString("pt-BR") : '-');
    const valores = normalized.map(d => d.total_vendas || 0);

    // Destrói chart existente antes de recriar (evita 'Canvas is already in use')
    try {
      const ctxVendas = document.getElementById("chartVendasDia");
      if (chartVendasDia) {
        chartVendasDia.destroy();
        chartVendasDia = null;
      }
        // Cria o gráfico com os dados filtrados
        chartVendasDia = new Chart(ctxVendas, {
          type: "line",
          data: {
            labels,
            datasets: [{
              label: "Faturamento (R$)",
              data: valores,
              borderColor: "#C41E3A",
              backgroundColor: "rgba(196, 30, 58, 0.1)",
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true }
            },
            scales: {
              x: { display: true, title: { display: true, text: 'Data' } },
              y: { display: true, title: { display: true, text: 'R$' } }
            }
          }
        });
    } catch (e) {
      console.warn('Erro ao criar chartVendasDia:', e);
    }

    // Vendas por pagamento
    const vendasPagamento = await fetch(`${API_URL}/relatorios/vendas-por-pagamento`).then(r => r.json());
  const labelsPag = vendasPagamento.map(d => (d.forma_pagamento || '').toUpperCase());
  const valoresPag = vendasPagamento.map(d => parseFloat(d.total_vendas));

    try {
      const ctxPag = document.getElementById("chartPagamento");
      if (chartPagamento) {
        chartPagamento.destroy();
        chartPagamento = null;
      }

      // Mapear cores por modalidade de pagamento para consistência visual
      const colorMap = {
        pix: '#06D6A0',      // verde água
        credito: '#118AB2',  // azul
        debito: '#EF476F',   // vermelho/rosa
        dinheiro: '#FFD166'  // amarelo
      };

      const backgroundColors = labelsPag.map(lbl => {
        const key = String(lbl || '').toLowerCase();
        return colorMap[key] || '#B0BEC5'; // cinza claro como fallback
      });

      chartPagamento = new Chart(ctxPag, {
        type: "pie",
        data: {
          labels: labelsPag,
          datasets: [{
            data: valoresPag,
            backgroundColor: backgroundColors
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    } catch (e) {
      console.warn('Erro ao criar chartPagamento:', e);
    }

    // Carrega gráfico de Vendas por Atendente (Top N selecionável)
    try {
      // carrega select de atendentes (apenas uma vez por sessão)
      try { populateAtendentesSelect(); } catch(e){}
      const sel = document.getElementById('selectAtendente');
      const atendenteId = sel && sel.value ? sel.value : '';
      await loadVendasPorAtendente(null, atendenteId || null);
    } catch (err) {
      console.warn('Falha ao carregar vendas por atendente:', err);
    }

  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    showAlert("Erro ao carregar dados do dashboard", "error");
  }
}

// ========== Controles de período para faturamento por dia ==========
function initPeriodoControls() {
  if (window._periodoControlsInit) return;
  window._periodoControlsInit = true;

  const filtro = document.getElementById('filtroPeriodo');
  const startEl = document.getElementById('periodStart');
  const endEl = document.getElementById('periodEnd');
  const selectMonth = document.getElementById('selectMonth');
  const applyBtn = document.getElementById('applyPeriodo');

  // popular select de meses (últimos 12 meses)
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const txt = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const opt = document.createElement('option');
    opt.value = val; opt.textContent = txt; selectMonth.appendChild(opt);
  }

  function updateVisibility() {
    const v = filtro.value;
    startEl.classList.add('hidden-inline');
    endEl.classList.add('hidden-inline');
    selectMonth.classList.add('hidden-inline');
    if (v === 'custom') {
      startEl.classList.remove('hidden-inline');
      endEl.classList.remove('hidden-inline');
    } else if (v === 'selectMonth') {
      selectMonth.classList.remove('hidden-inline');
    }
  }

  filtro.addEventListener('change', updateVisibility);
  applyBtn.addEventListener('click', () => {
    // recarrega dashboard (só o dashboard parte de charts)
    loadDashboard();
  });

  updateVisibility();
}

function buildPeriodoQuery() {
  const filtro = document.getElementById('filtroPeriodo');
  if (!filtro) return '';
  const v = filtro.value || 'preset:day';
  if (v.startsWith('preset:')) {
    const p = v.split(':')[1];
    return `?preset=${encodeURIComponent(p)}`;
  }
  if (v === 'custom') {
    const s = document.getElementById('periodStart').value;
    const e = document.getElementById('periodEnd').value;
    const parts = [];
    if (s) parts.push(`start=${encodeURIComponent(s)}`);
    if (e) parts.push(`end=${encodeURIComponent(e)}`);
    return parts.length ? `?${parts.join('&')}` : '';
  }
  if (v === 'selectMonth') {
    const m = document.getElementById('selectMonth').value;
    return m ? `?month=${encodeURIComponent(m)}` : '';
  }
  return '';
}

// vendas por atendente removido (reversão)

// ========== ATENDENTES ==========
async function loadAtendentes() {
  const loading = document.getElementById("loadingAtendentes");
  const tbody = document.getElementById("atendenteTableBody");
  
  loading.classList.add("show");
  tbody.innerHTML = "";
  
  try {
    const response = await fetch(`${API_URL}/atendentes`);
    const atendentes = await response.json();
    
    if (atendentes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">Nenhum atendente cadastrado</td></tr>';
    } else {
      atendentes.forEach(atendente => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${atendente.id_atendente}</td>
          <td>${atendente.nome}</td>
          <td>${atendente.cpf}</td>
          <td>${atendente.telefone || "-"}</td>
          <td>${atendente.login}</td>
          <td><span class="status-badge">${atendente.tipo_usuario}</span></td>
          <td class="actions">
            <button class="action-btn action-edit" onclick="editAtendente(${atendente.id_atendente})">✏️ Editar</button>
            <button class="action-btn action-delete" onclick="deleteAtendente(${atendente.id_atendente})">🗑️ Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar atendentes:", error);
    showAlert("Erro ao carregar atendentes", "error");
  } finally {
    loading.classList.remove("show");
  }
}

function openAtendenteModal(id = null) {
  const modal = document.getElementById("atendenteModal");
  const form = document.getElementById("atendenteForm");
  const title = document.getElementById("atendenteModalTitle");
  
  form.reset();
  document.getElementById("atendenteId").value = "";
  
  if (id) {
    title.textContent = "Editar Atendente";
    // Carrega dados do atendente
    fetch(`${API_URL}/atendentes/${id}`)
      .then(r => r.json())
      .then(atendente => {
        document.getElementById("atendenteId").value = atendente.id_atendente;
        document.getElementById("atendenteNome").value = atendente.nome;
        document.getElementById("atendenteCpf").value = atendente.cpf;
        document.getElementById("atendenteTelefone").value = atendente.telefone || "";
        document.getElementById("atendenteLogin").value = atendente.login;
        document.getElementById("atendenteSenha").value = atendente.senha;
        document.getElementById("atendenteTipo").value = atendente.tipo_usuario;
      });
  } else {
    title.textContent = "Novo Atendente";
  }
  
  modal.classList.add("active");
}

// Abre o modal de Finalizar Pedido preenchendo o id do pedido
async function openFinalizarModal(pedidoId) {
  const modal = document.getElementById('finalizarModal');
  const input = document.getElementById('finalizarPedidoId');
  const select = document.getElementById('finalizarForma');
  const resumoEl = document.getElementById('finalizarResumo');
  if (!modal || !input || !select) {
    console.warn('openFinalizarModal: elementos do modal não encontrados');
    return;
  }
  input.value = pedidoId;
  select.value = '';
  // Populate summary: try to use cached pedido and item list, else fetch
  try {
    if (resumoEl) resumoEl.innerHTML = '<div class="resumo-empty">Carregando resumo do pedido...</div>';

    // Get pedido from cache or fetch
    let pedido = (window.cachedPedidos || []).find(p => String(p.id_pedido) === String(pedidoId));
    if (!pedido) {
      const r = await fetch(`${API_URL}/pedidos/${pedidoId}`);
      if (r.ok) pedido = await r.json();
    }

    // Fetch all itempedidos and filter by pedido
  const ir = await fetch(`${API_URL}/itens-pedido`);
    let itens = [];
    if (ir.ok) {
      const all = await ir.json();
      itens = all.filter(i => String(i.id_pedido) === String(pedidoId));
    }

    // Build HTML
    if (resumoEl) {
      if (itens.length === 0) {
        // fallback to observacoes/summary from pedido
        const texto = pedido?.observacoes ? `<div class="resumo-observacoes">${escapeHtml(pedido.observacoes)}</div>` : '<div class="resumo-empty">Nenhum item encontrado para este pedido.</div>';
        const totalText = pedido?.total ? `<div class="resumo-total">Total: R$ ${parseFloat(pedido.total).toFixed(2)}</div>` : '';
        resumoEl.innerHTML = texto + totalText;
      } else {
        const itemsHtml = itens.map(it => {
          const nome = it.Produto?.nome || it.nome || 'Item';
          const qtd = it.quantidade || 1;
          const subtotal = parseFloat(it.subtotal || (it.preco_unitario * qtd) || 0).toFixed(2);
          return `<div class="resumo-item"><span class="resumo-item-nome">${escapeHtml(nome)}</span> <span class="resumo-item-qtd">x${qtd}</span> <span class="resumo-item-sub">R$ ${subtotal}</span></div>`;
        }).join('');
        const totalCalc = itens.reduce((s, it) => s + (parseFloat(it.subtotal || 0) || 0), 0);
        const totalHtml = `<div class="resumo-total">Total calculado: R$ ${totalCalc.toFixed(2)}</div>`;
        resumoEl.innerHTML = `<div class="resumo-list">${itemsHtml}</div>${totalHtml}`;
      }
    }
  } catch (err) {
    console.warn('Erro ao popular resumo do pedido:', err);
    if (resumoEl) resumoEl.innerHTML = '<div class="resumo-empty">Erro ao carregar resumo</div>';
  }

  modal.classList.add('active');
  // focus no select de forma de pagamento para acessibilidade
  try { select.focus(); } catch (e) {}
}

// utilitário minúsculo para escapar HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Handler do formulário de finalizar pedido (modal)
const finalizarForm = document.getElementById('finalizarForm');
if (finalizarForm) {
  finalizarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('finalizarPedidoId').value;
    const forma = document.getElementById('finalizarForma').value;
    if (!id) return showAlert('Pedido inválido', 'error');
    if (!forma) return showAlert('Selecione a forma de pagamento', 'error');

    try {
      const response = await fetch(`${API_URL}/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'finalizado', forma_pagamento: forma })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        showAlert(err?.message || 'Erro ao finalizar pedido', 'error');
        return;
      }

      const respJson = await response.json();
      const vendaCriada = respJson?.vendaCriada || respJson?.result?.vendaCriada || null;

      showAlert('Pedido finalizado com sucesso!', 'success');
      closeModal('finalizarModal');

      if (vendaCriada) {
        loadVendas();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const vendasLink = document.querySelector('.nav-link[data-section="vendas"]');
        if (vendasLink) vendasLink.classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const vendasSection = document.getElementById('vendas');
        if (vendasSection) vendasSection.classList.add('active');
      } else {
        loadPedidos();
      }
    } catch (err) {
      console.error('Erro ao finalizar pedido via modal:', err);
      showAlert(err.message || 'Erro ao finalizar pedido', 'error');
    }
  });
}

async function editAtendente(id) {
  openAtendenteModal(id);
}

document.getElementById("atendenteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = document.getElementById("atendenteId").value;
  const data = {
    nome: document.getElementById("atendenteNome").value,
    cpf: document.getElementById("atendenteCpf").value,
    telefone: document.getElementById("atendenteTelefone").value,
    login: document.getElementById("atendenteLogin").value,
    senha: document.getElementById("atendenteSenha").value,
    tipo_usuario: document.getElementById("atendenteTipo").value
  };
  
  try {
    const url = id ? `${API_URL}/atendentes/${id}` : `${API_URL}/atendentes`;
    const method = id ? "PUT" : "POST";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showAlert(id ? "Atendente atualizado com sucesso!" : "Atendente criado com sucesso!", "success");
      closeModal("atendenteModal");
      loadAtendentes();
    } else {
      const error = await response.json();
      showAlert(error.message || "Erro ao salvar atendente", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao salvar atendente", "error");
  }
});

async function deleteAtendente(id) {
  if (!confirm("Tem certeza que deseja excluir este atendente?")) return;
  
  try {
    const response = await fetch(`${API_URL}/atendentes/${id}`, { method: "DELETE" });
    
    if (response.ok) {
      showAlert("Atendente excluído com sucesso!", "success");
      loadAtendentes();
    } else {
      showAlert("Erro ao excluir atendente", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao excluir atendente", "error");
  }
}

// ========== PRODUTOS ==========
async function loadVendasPorAtendente(top = null, atendenteId = null) {
  try {
    let url = `${API_URL}/relatorios/vendas-por-atendente`;
    const params = [];
    if (top && Number.isInteger(top) && top > 0) params.push(`top=${encodeURIComponent(top)}`);
    if (atendenteId) params.push(`atendente=${encodeURIComponent(atendenteId)}`);
    if (params.length) url += `?${params.join('&')}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('Resposta não OK ao buscar vendas por atendente');
      return;
    }
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) {
      if (chartAtendente) { try { chartAtendente.destroy(); } catch(e){} chartAtendente = null; }
      return;
    }

    const labels = data.map(d => d.nome_atendente || `ID ${d.id_atendente}`);
    const valores = data.map(d => parseFloat(d.total_vendas) || 0);

    const ctx = document.getElementById('chartAtendente');
    if (!ctx) return;

    if (chartAtendente) { try { chartAtendente.destroy(); } catch(e) { console.warn('Erro destruindo chartAtendente', e); } chartAtendente = null; }

    chartAtendente = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Total vendido (R$)', data: valores, backgroundColor: '#118AB2' }] },
      options: {
        indexAxis: 'y', // horizontal bars
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: true, title: { display: true, text: 'R$' } },
          y: { display: true, title: { display: true, text: 'Atendente' } }
        }
      }
    });
  } catch (err) {
    console.error('Erro carregando vendas por atendente:', err);
  }
}

// popula select de atendentes
async function populateAtendentesSelect() {
  try {
    const sel = document.getElementById('selectAtendente');
    if (!sel) return;
    // se já foi populado (mais de 1 option), não repopular
    if (sel.options.length > 1) return;
    const resp = await fetch(`${API_URL}/atendentes`);
    if (!resp.ok) return;
    const data = await resp.json();
    data.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id_atendente;
      opt.textContent = a.nome || `ID ${a.id_atendente}`;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.warn('Erro ao popular select de atendentes', err);
  }
}

// conecta handler do seletor de atendente
const applyAtBtn = document.getElementById('applyAtendente');
if (applyAtBtn) {
  applyAtBtn.addEventListener('click', () => {
    const sel = document.getElementById('selectAtendente');
    const id = sel && sel.value ? sel.value : null;
    loadVendasPorAtendente(null, id);
  });
}
 

// Permite buscar ao pressionar Enter no input de busca
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('produtoSearchInput');
  if (input) {
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') searchProdutos();
    });
  }
  // Garantir que o botão de busca chame a função (em caso de onclick inline não funcionar)
  const btn = document.getElementById('produtoSearchBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      searchProdutos();
    });
  }
  // botão limpar pesquisa
  const clearBtn = document.getElementById('produtoClearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearProdutoSearch();
    });
  }
});

// Carrega lista de produtos (tela de gerenciamento)
async function loadProdutos() {
  const loading = document.getElementById('loadingProdutos');
  const tbody = document.getElementById('produtoTableBody');
  const countEl = document.getElementById('produtoResultsCount');

  if (loading) loading.classList.add('show');
  if (tbody) tbody.innerHTML = '';
  if (countEl) countEl.textContent = '';

  try {
    const resp = await fetch(`${API_URL}/produtos`);
    if (!resp.ok) {
      showAlert('Erro ao carregar produtos', 'error');
      return;
    }
    const produtos = await resp.json();

    if (!Array.isArray(produtos) || produtos.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#999; padding:1rem;">Nenhum produto cadastrado</td></tr>';
      if (countEl) countEl.textContent = '0 produtos';
      return;
    }

    produtos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id_produto}</td>
        <td>${escapeHtml(p.nome)}</td>
        <td>${escapeHtml(p.categoria || '')}</td>
        <td>R$ ${parseFloat(p.preco || 0).toFixed(2)}</td>
        <td>${p.quantidade_estoque || 0}</td>
        <td><span class="status-badge status-${p.status}">${p.status}</span></td>
        <td class="actions">
          <button class="action-btn action-edit" onclick="editProduto(${p.id_produto})">✏️ Editar</button>
          <button class="action-btn action-delete" onclick="deleteProduto(${p.id_produto})">🗑️ Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (countEl) countEl.textContent = `${produtos.length} produto(s)`;
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    showAlert('Erro ao carregar produtos', 'error');
  } finally {
    if (loading) loading.classList.remove('show');
  }
}

// Busca de produtos pela caixa de pesquisa
function searchProdutos() {
  const input = document.getElementById('produtoSearchInput');
  const q = input ? input.value.trim() : '';
  if (!q) return loadProdutos();

  (async () => {
    const loading = document.getElementById('loadingProdutos');
    const tbody = document.getElementById('produtoTableBody');
    const countEl = document.getElementById('produtoResultsCount');
    if (loading) loading.classList.add('show');
    if (tbody) tbody.innerHTML = '';
    if (countEl) countEl.textContent = '';

    try {
      const resp = await fetch(`${API_URL}/produtos?search=${encodeURIComponent(q)}`);
      if (!resp.ok) {
        showAlert('Erro ao buscar produtos', 'error');
        return;
      }
      const produtos = await resp.json();

      if (!Array.isArray(produtos) || produtos.length === 0) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#999; padding:1rem;">Nenhum produto encontrado</td></tr>';
        if (countEl) countEl.textContent = '0 produtos';
        return;
      }

      produtos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.id_produto}</td>
          <td>${escapeHtml(p.nome)}</td>
          <td>${escapeHtml(p.categoria || '')}</td>
          <td>R$ ${parseFloat(p.preco || 0).toFixed(2)}</td>
          <td>${p.quantidade_estoque || 0}</td>
          <td><span class="status-badge status-${p.status}">${p.status}</span></td>
          <td class="actions">
            <button class="action-btn action-edit" onclick="editProduto(${p.id_produto})">✏️ Editar</button>
            <button class="action-btn action-delete" onclick="deleteProduto(${p.id_produto})">🗑️ Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      if (countEl) countEl.textContent = `${produtos.length} produto(s)`;
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      showAlert('Erro ao buscar produtos', 'error');
    } finally {
      if (loading) loading.classList.remove('show');
    }
  })();
}

// Limpa o campo de pesquisa e recarrega a lista completa
function clearProdutoSearch() {
  const input = document.getElementById('produtoSearchInput');
  if (input) input.value = '';
  // atualiza UI e recarrega produtos
  try { loadProdutos(); } catch (e) { console.warn('clearProdutoSearch: loadProdutos não disponível', e); }
}

function openProdutoModal(id = null) {
  const modal = document.getElementById("produtoModal");
  const form = document.getElementById("produtoForm");
  const title = document.getElementById("produtoModalTitle");
  
  form.reset();
  document.getElementById("produtoId").value = "";
  
  if (id) {
    title.textContent = "Editar Produto";
    fetch(`${API_URL}/produtos/${id}`)
      .then(r => r.json())
      .then(produto => {
        document.getElementById("produtoId").value = produto.id_produto;
        document.getElementById("produtoNome").value = produto.nome;
        document.getElementById("produtoCategoria").value = produto.categoria || "";
        document.getElementById("produtoPreco").value = produto.preco;
        document.getElementById("produtoEstoque").value = produto.quantidade_estoque;
        document.getElementById("produtoStatus").value = produto.status;
        document.getElementById("produtoFoto").value = produto.foto || "";
        document.getElementById("produtoDescricao").value = produto.descricao || "";
      });
  } else {
    title.textContent = "Novo Produto";
  }
  
  modal.classList.add("active");
}

async function editProduto(id) {
  openProdutoModal(id);
}

document.getElementById("produtoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = document.getElementById("produtoId").value;
  const data = {
    nome: document.getElementById("produtoNome").value,
    categoria: document.getElementById("produtoCategoria").value,
    preco: parseFloat(document.getElementById("produtoPreco").value),
    quantidade_estoque: parseInt(document.getElementById("produtoEstoque").value),
    status: document.getElementById("produtoStatus").value,
    foto: document.getElementById("produtoFoto").value,
    descricao: document.getElementById("produtoDescricao").value
  };
  
  try {
    const url = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;
    const method = id ? "PUT" : "POST";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showAlert(id ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!", "success");
      closeModal("produtoModal");
      loadProdutos();
    } else {
      showAlert("Erro ao salvar produto", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao salvar produto", "error");
  }
});

async function deleteProduto(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;
  
  try {
    const response = await fetch(`${API_URL}/produtos/${id}`, { method: "DELETE" });
    
    if (response.ok) {
      showAlert("Produto excluído com sucesso!", "success");
      loadProdutos();
    } else {
      showAlert("Erro ao excluir produto", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao excluir produto", "error");
  }
}

// ========== MESAS ==========
async function loadMesas() {
  const loading = document.getElementById("loadingMesas");
  const tbody = document.getElementById("mesaTableBody");
  
  loading.classList.add("show");
  tbody.innerHTML = "";
  
    try {
      const response = await fetch(`${API_URL}/mesas`);
      const mesas = await response.json();
    
      // Listamos todas as mesas cadastradas (mostrando também o status)
      // Isso evita que nenhum item apareça quando todas as mesas estiverem ocupadas
      if (mesas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">Nenhuma mesa cadastrada</td></tr>';
      } else {
        mesas.forEach(mesa => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${mesa.id_mesa}</td>
            <td>${mesa.numero_mesa}</td>
            <td><span class="status-badge status-${mesa.status}">${mesa.status}</span></td>
            <td class="actions">
              <button class="action-btn action-edit" onclick="editMesa(${mesa.id_mesa})">✏️ Editar</button>
              <button class="action-btn action-delete" onclick="deleteMesa(${mesa.id_mesa})">🗑️ Excluir</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
  } catch (error) {
    console.error("Erro ao carregar mesas:", error);
    showAlert("Erro ao carregar mesas", "error");
  } finally {
    loading.classList.remove("show");
  }
}

function openMesaModal(id = null) {
  const modal = document.getElementById("mesaModal");
  const form = document.getElementById("mesaForm");
  const title = document.getElementById("mesaModalTitle");
  
  form.reset();
  document.getElementById("mesaId").value = "";
  
  if (id) {
    title.textContent = "Editar Mesa";
    fetch(`${API_URL}/mesas/${id}`)
      .then(r => r.json())
      .then(mesa => {
        document.getElementById("mesaId").value = mesa.id_mesa;
        document.getElementById("mesaNumero").value = mesa.numero_mesa;
        document.getElementById("mesaStatus").value = mesa.status;
      });
  } else {
    title.textContent = "Nova Mesa";
  }
  
  modal.classList.add("active");
}

async function editMesa(id) {
  openMesaModal(id);
}

document.getElementById("mesaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = document.getElementById("mesaId").value;
  const data = {
    numero_mesa: parseInt(document.getElementById("mesaNumero").value),
    status: document.getElementById("mesaStatus").value
  };
  
  try {
    const url = id ? `${API_URL}/mesas/${id}` : `${API_URL}/mesas`;
    const method = id ? "PUT" : "POST";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showAlert(id ? "Mesa atualizada com sucesso!" : "Mesa criada com sucesso!", "success");
      closeModal("mesaModal");
      loadMesas();
    } else {
      showAlert("Erro ao salvar mesa", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao salvar mesa", "error");
  }
});

async function deleteMesa(id) {
  if (!confirm("Tem certeza que deseja excluir esta mesa?")) return;
  
  try {
    const response = await fetch(`${API_URL}/mesas/${id}`, { method: "DELETE" });
    
    if (response.ok) {
      showAlert("Mesa excluída com sucesso!", "success");
      loadMesas();
    } else {
      showAlert("Erro ao excluir mesa", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao excluir mesa", "error");
  }
}

// ========== PEDIDOS ==========
async function loadPedidos() {
  // Carrega o cardápio
  await loadCardapio();
  
  // Carrega mesas e atendentes para o carrinho
  await loadMesasCarrinho();
  await loadAtendentesCarrinho();
  
  // Carrega lista de pedidos realizados
  const loading = document.getElementById("loadingPedidos");
  const tbody = document.getElementById("pedidoTableBody");
  
  loading.classList.add("show");
  tbody.innerHTML = "";
  
  try {
    const response = await fetch(`${API_URL}/pedidos`);
    const pedidos = await response.json();

    // Cache local dos pedidos para filtros/ordenacao e badge
    window.cachedPedidos = pedidos || [];

    // Renderiza usando cache (aplica filtros/ordenacao se houver)
    renderPedidosFromCache();

    // Atualiza badge de pedidos abertos
    updateVendasBadge();
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    showAlert("Erro ao carregar pedidos", "error");
  } finally {
    loading.classList.remove("show");
  }
}

// Conectar listeners dos controles de filtro/ordenacao (se existirem)
try {
  const filterEl = document.getElementById('pedidoFilterStatus');
  const sortEl = document.getElementById('pedidoSortBy');
  if (filterEl) filterEl.addEventListener('change', renderPedidosFromCache);
  if (sortEl) sortEl.addEventListener('change', renderPedidosFromCache);
} catch (err) {
  // não crítico
}

// Carrega o cardápio de produtos
async function loadCardapio() {
  const loading = document.getElementById("loadingCardapio");
  const grid = document.getElementById("cardapioGrid");
  
  loading.classList.add("show");
  grid.innerHTML = "";
  
  try {
    const response = await fetch(`${API_URL}/produtos`);
    const produtos = await response.json();
    
    // Filtra apenas produtos ativos
    const produtosAtivos = produtos.filter(p => p.status === 'ativo');
    
    if (produtosAtivos.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🍔</div><p>Nenhum produto disponível no momento</p></div>';
    } else {
      produtosAtivos.forEach(produto => {
        const card = document.createElement("div");
        card.className = "produto-card";
        
        const semEstoque = produto.quantidade_estoque === 0;
        const imagemUrl = produto.foto || '';
        const ingredientes = produto.descricao || 'Delicioso produto do nosso cardápio';
        
        card.innerHTML = `
          <div class="produto-imagem">
            ${imagemUrl ? `<img src="${imagemUrl}" alt="${produto.nome}" onerror="this.parentElement.innerHTML='🍔'">` : '🍔'}
          </div>
          ${semEstoque ? '<div class="produto-estoque">Sem Estoque</div>' : ''}
          <div class="produto-info">
            <h3 class="produto-nome">${produto.nome}</h3>
            ${produto.categoria ? `<span class="produto-categoria">${produto.categoria}</span>` : ''}
            <p class="produto-ingredientes">${ingredientes}</p>
            <div class="produto-footer">
              <div class="produto-preco">
                <small>R$</small> ${parseFloat(produto.preco).toFixed(2)}
              </div>
              <button 
                class="btn-add-produto" 
                onclick="adicionarAoCarrinho(${produto.id_produto})"
                ${semEstoque ? 'disabled' : ''}
              >
                ➕ Adicionar
              </button>
            </div>
          </div>
        `;
        
        grid.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    showAlert("Erro ao carregar cardápio", "error");
  } finally {
    loading.classList.remove("show");
  }
}

// Adiciona produto ao carrinho
async function adicionarAoCarrinho(idProduto) {
  try {
    const response = await fetch(`${API_URL}/produtos/${idProduto}`);
    const produto = await response.json();
    
    // Verifica se já está no carrinho
    const itemExistente = carrinho.find(item => item.id_produto === idProduto);
    
    if (itemExistente) {
      // Verifica estoque antes de aumentar quantidade
      if (itemExistente.quantidade < produto.quantidade_estoque) {
        itemExistente.quantidade++;
        showAlert(`Quantidade de ${produto.nome} aumentada!`, "success");
      } else {
        showAlert(`Estoque insuficiente de ${produto.nome}`, "error");
        return;
      }
    } else {
      // Adiciona novo item
      carrinho.push({
        id_produto: produto.id_produto,
        nome: produto.nome,
        preco: parseFloat(produto.preco),
        quantidade: 1,
        foto: produto.foto,
        estoque_maximo: produto.quantidade_estoque
      });
      showAlert(`${produto.nome} adicionado ao carrinho!`, "success");
    }
    
    atualizarCarrinho();
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    showAlert("Erro ao adicionar produto", "error");
  }
}

// Atualiza a visualização do carrinho
function atualizarCarrinho() {
  const carrinhoDiv = document.getElementById("carrinhoItens");
  
  if (carrinho.length === 0) {
    carrinhoDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <p>Carrinho vazio. Adicione produtos do cardápio acima.</p>
      </div>
    `;
    document.getElementById("carrinhoTotal").textContent = "R$ 0,00";
    return;
  }
  
  let html = '';
  let total = 0;
  
  carrinho.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    
    html += `
      <div class="carrinho-item">
        <div class="carrinho-item-imagem">
          ${item.foto ? `<img src="${item.foto}" alt="${item.nome}" onerror="this.parentElement.innerHTML='🍔'">` : '🍔'}
        </div>
        <div class="carrinho-item-info">
          <div class="carrinho-item-nome">${item.nome}</div>
          <div class="carrinho-item-preco">R$ ${item.preco.toFixed(2)} cada</div>
        </div>
        <div class="carrinho-item-controls">
          <button class="btn-quantidade" onclick="diminuirQuantidade(${index})">-</button>
          <span class="carrinho-item-quantidade">${item.quantidade}</span>
          <button class="btn-quantidade" onclick="aumentarQuantidade(${index})">+</button>
        </div>
        <div class="carrinho-item-subtotal">R$ ${subtotal.toFixed(2)}</div>
        <button class="btn-remover-item" onclick="removerItem(${index})">🗑️</button>
      </div>
    `;
  });
  
  carrinhoDiv.innerHTML = html;
  document.getElementById("carrinhoTotal").textContent = `R$ ${total.toFixed(2)}`;
}

// Aumenta quantidade de um item
function aumentarQuantidade(index) {
  const item = carrinho[index];
  
  if (item.quantidade < item.estoque_maximo) {
    item.quantidade++;
    atualizarCarrinho();
  } else {
    showAlert("Estoque insuficiente", "error");
  }
}

// Diminui quantidade de um item
function diminuirQuantidade(index) {
  const item = carrinho[index];
  
  if (item.quantidade > 1) {
    item.quantidade--;
    atualizarCarrinho();
  } else {
    removerItem(index);
  }
}

// Remove um item do carrinho
function removerItem(index) {
  const item = carrinho[index];
  carrinho.splice(index, 1);
  showAlert(`${item.nome} removido do carrinho`, "info");
  atualizarCarrinho();
}

// Limpa todo o carrinho
function limparCarrinho() {
  if (carrinho.length === 0) {
    showAlert("Carrinho já está vazio", "info");
    return;
  }
  
  if (confirm("Deseja limpar todo o carrinho?")) {
    carrinho = [];
    atualizarCarrinho();
    showAlert("Carrinho limpo com sucesso", "success");
  }
}

// Carrega mesas para o carrinho
async function loadMesasCarrinho() {
  try {
    const response = await fetch(`${API_URL}/mesas`);
    const mesas = await response.json();
    const select = document.getElementById("carrinhoMesa");

    // preserve previous selection if any
    const prev = select ? select.value : null;

    select.innerHTML = '<option value="">Selecione a mesa...</option>';
    // opção para viagem
    const viagemOpt = document.createElement("option");
    viagemOpt.value = "viagem";
    viagemOpt.textContent = "Pedido para viagem";
    select.appendChild(viagemOpt);

    // Listar apenas mesas livres para o carrinho (criação de pedido)
    const mesasLivres = mesas.filter(m => m.status === 'livre');
    mesasLivres.forEach(mesa => {
      const option = document.createElement("option");
      option.value = mesa.id_mesa;
      option.textContent = `Mesa ${mesa.numero_mesa} - ${mesa.status}`;
      select.appendChild(option);
    });

    // restore previous selection if still available
    try {
      if (prev) {
        const exists = Array.from(select.options).some(o => String(o.value) === String(prev));
        if (exists) select.value = prev;
      }

      // override with persisted selection from localStorage if available
      try {
        const stored = localStorage.getItem('carrinho_mesa');
        if (stored) {
          const exists2 = Array.from(select.options).some(o => String(o.value) === String(stored));
          if (exists2) select.value = stored;
        }
      } catch(e) {}
    } catch (e) {}
  } catch (error) {
    console.error("Erro ao carregar mesas:", error);
  }
}

// Carrega atendentes para o carrinho
async function loadAtendentesCarrinho() {
  try {
    const response = await fetch(`${API_URL}/atendentes`);
    const atendentes = await response.json();
    const select = document.getElementById("carrinhoAtendente");

    // preserve previous selection if any
    const prev = select ? select.value : null;

    select.innerHTML = '<option value="">Selecione o atendente...</option>';
    atendentes.forEach(atendente => {
      const option = document.createElement("option");
      option.value = atendente.id_atendente;
      option.textContent = atendente.nome;
      select.appendChild(option);
    });

    // restore previous selection if still available
    try {
      if (prev) {
        const exists = Array.from(select.options).some(o => String(o.value) === String(prev));
        if (exists) select.value = prev;
      }

      // override with persisted selection from localStorage if available
      try {
        const stored = localStorage.getItem('carrinho_atendente');
        if (stored) {
          const exists2 = Array.from(select.options).some(o => String(o.value) === String(stored));
          if (exists2) select.value = stored;
        }
      } catch(e) {}
    } catch (e) {}
  } catch (error) {
    console.error("Erro ao carregar atendentes:", error);
  }
}

// preserva seleção de forma de pagamento no carrinho (não depende de API)
function preserveCarrinhoPagamentoSelection() {
  try {
    const select = document.getElementById('carrinhoPagamento');
    if (!select) return;
    const prev = select.value;
    // reconstrói as opções estáticas (caso alguém sobrescreva) e restaura prev
    const options = [
      { v: '', t: 'Selecione (opcional)' },
      { v: 'pix', t: 'PIX' },
      { v: 'credito', t: 'Crédito' },
      { v: 'debito', t: 'Débito' },
      { v: 'dinheiro', t: 'Dinheiro' }
    ];
    select.innerHTML = '';
    options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.v; opt.textContent = o.t; select.appendChild(opt);
    });
    if (prev) {
      const exists = Array.from(select.options).some(o => String(o.value) === String(prev));
      if (exists) select.value = prev;
    }
  } catch (err) {
    console.warn('Erro preservando seleção de pagamento do carrinho', err);
  }
}

// Salva seleções do carrinho no localStorage
function saveCarrinhoSelections() {
  try {
    const cm = document.getElementById('carrinhoMesa');
    const ca = document.getElementById('carrinhoAtendente');
    const cp = document.getElementById('carrinhoPagamento');
    if (cm) localStorage.setItem('carrinho_mesa', cm.value || '');
    if (ca) localStorage.setItem('carrinho_atendente', ca.value || '');
    if (cp) localStorage.setItem('carrinho_pagamento', cp.value || '');
  } catch (err) {
    console.warn('Erro salvando seleções do carrinho:', err);
  }
}

// Carrega seleções salvas do localStorage e aplica aos selects se possível
function loadCarrinhoSelections() {
  try {
    const cm = document.getElementById('carrinhoMesa');
    const ca = document.getElementById('carrinhoAtendente');
    const cp = document.getElementById('carrinhoPagamento');
    try {
      const sm = localStorage.getItem('carrinho_mesa');
      if (sm && cm) {
        const exists = Array.from(cm.options).some(o => String(o.value) === String(sm));
        if (exists) cm.value = sm;
      }
    } catch(e) {}
    try {
      const sa = localStorage.getItem('carrinho_atendente');
      if (sa && ca) {
        const exists = Array.from(ca.options).some(o => String(o.value) === String(sa));
        if (exists) ca.value = sa;
      }
    } catch(e) {}
    try {
      const sp = localStorage.getItem('carrinho_pagamento');
      if (sp && cp) {
        const exists = Array.from(cp.options).some(o => String(o.value) === String(sp));
        if (exists) cp.value = sp;
      }
    } catch(e) {}
  } catch (err) {
    console.warn('Erro carregando seleções do carrinho:', err);
  }
}

// Finaliza o pedido
async function finalizarPedido() {
  const idMesa = document.getElementById("carrinhoMesa").value;
  const idAtendente = document.getElementById("carrinhoAtendente").value;

  // Validações
  if (!idMesa) {
    showAlert("Selecione uma mesa ou escolha 'Pedido para viagem'", "error");
    return;
  }

  if (!idAtendente) {
    showAlert("Selecione um atendente para o pedido", "error");
    return;
  }

  if (carrinho.length === 0) {
    showAlert("Adicione produtos ao carrinho antes de finalizar", "error");
    return;
  }

  // Calcula total
  const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

  const pedidoData = {
    id_mesa: idMesa === 'viagem' ? null : parseInt(idMesa),
    id_atendente: parseInt(idAtendente),
    status: "aberto",
    total: total,
    observacoes: `Pedido com ${carrinho.length} item(ns): ${carrinho.map(i => `${i.nome} (${i.quantidade}x)`).join(', ')}`
  };

  try {
    // anexa os itens ao payload para criação atômica no backend
    pedidoData.itens = carrinho.map(i => ({ id_produto: i.id_produto, quantidade: i.quantidade }));

    const response = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedidoData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      showAlert(error?.message || "Erro ao criar pedido", "error");
      return;
    }

    const respJson = await response.json();

    // Se o backend criou uma venda automaticamente, navegar para Vendas
    const vendaCriada = respJson?.vendaCriada || respJson?.novo?.vendaCriada || respJson?.result?.vendaCriada || null;

    // Atualiza status da mesa para ocupada (somente se não for pedido para viagem)
    if (idMesa !== 'viagem') {
      await fetch(`${API_URL}/mesas/${idMesa}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ocupada" })
      });
    }

    // sucesso: backend deve ter criado pedido + itens atomically
    showAlert(vendaCriada ? `Pedido criado e Venda registrada (ID: ${vendaCriada.id_venda})` : `Pedido criado com sucesso!`, "success");

    // Se o backend retornou os itens criados, mostrar detalhe em modal
    try {
      const itensCriados = respJson?.itensCriados || respJson?.itens || respJson?.result?.itensCriados || respJson?.novo?.itensCriados;
      const pedidoIdResposta = respJson?.novo?.id_pedido || respJson?.id_pedido || (respJson?.novo && respJson.novo && respJson.novo.id_pedido) || null;
      if (Array.isArray(itensCriados) && itensCriados.length > 0) {
        showItensCriadosModal(itensCriados, pedidoIdResposta);
      }
    } catch (err) {
      console.warn('Erro ao processar itensCriados da resposta:', err);
    }

    // Limpa o carrinho
    carrinho = [];
    atualizarCarrinho();

    // Limpa seleções
    try { document.getElementById("carrinhoMesa").value = ""; } catch(e) {}
    try { document.getElementById("carrinhoAtendente").value = ""; } catch(e) {}
    // limpa seleção de forma de pagamento do carrinho se existir
    try { const cp = document.getElementById('carrinhoPagamento'); if (cp) cp.value = ''; } catch(e) {}

    // salva o estado das seleções no storage
    try { saveCarrinhoSelections(); } catch(e) {}

    // Recarrega dados
    loadPedidos();

    // preserva seleção de pagamento do carrinho ao recarregar pedidos
    try { preserveCarrinhoPagamentoSelection(); } catch(e) {}

    if (vendaCriada) {
      // Navega para a aba Vendas e recarrega
      loadVendas();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const vendasLink = document.querySelector('.nav-link[data-section="vendas"]');
      if (vendasLink) vendasLink.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      const vendasSection = document.getElementById('vendas');
      if (vendasSection) vendasSection.classList.add('active');
    }

  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    showAlert(error.message || "Erro ao finalizar pedido", "error");
  }
}

async function openPedidoModal(id = null) {
  const modal = document.getElementById("pedidoModal");
  const form = document.getElementById("pedidoForm");
  const title = document.getElementById("pedidoModalTitle");
  
  form.reset();
  document.getElementById("pedidoId").value = "";
  
  // Carrega mesas e atendentes para os selects
  await loadMesasSelect();
  await loadAtendentesSelect();
  
  if (id) {
    title.textContent = "Editar Pedido";
    fetch(`${API_URL}/pedidos/${id}`)
      .then(r => r.json())
      .then(pedido => {
        document.getElementById("pedidoId").value = pedido.id_pedido;
        const pedidoMesaSelect = document.getElementById("pedidoMesa");
        // se pedido for para viagem
        if (pedido.id_mesa === null) {
          pedidoMesaSelect.value = 'viagem';
        } else {
          // garante que a opção da mesa exista (caso esteja ocupada e não listada)
          if (!Array.from(pedidoMesaSelect.options).some(o => o.value == pedido.id_mesa)) {
            const opt = document.createElement('option');
            opt.value = pedido.id_mesa;
            opt.textContent = `Mesa ${pedido.Mesa?.numero_mesa || pedido.id_mesa} (atual)`;
            pedidoMesaSelect.appendChild(opt);
          }
          pedidoMesaSelect.value = pedido.id_mesa;
        }
        document.getElementById("pedidoAtendente").value = pedido.id_atendente;
        document.getElementById("pedidoStatus").value = pedido.status;
        document.getElementById("pedidoPagamento").value = pedido.forma_pagamento || "";
        document.getElementById("pedidoTotal").value = pedido.total;
        document.getElementById("pedidoObservacoes").value = pedido.observacoes || "";
        // Mostrar informação caso já exista uma venda vinculada a esse pedido
        try {
          const vendaInfoEl = document.getElementById('pedidoVendaInfo');
          fetch(`${API_URL}/vendas`)
            .then(r => r.json())
            .then(vendas => {
              const venda = vendas.find(v => v.id_pedido == pedido.id_pedido || (v.Pedido && v.Pedido.id_pedido == pedido.id_pedido));
              if (venda) {
                vendaInfoEl.style.display = 'block';
                vendaInfoEl.textContent = `Venda registrada: ID ${venda.id_venda} • ${venda.forma_pagamento || ''} • R$ ${Number(venda.valor_total || venda.valor_total).toFixed(2)}`;
              } else {
                vendaInfoEl.style.display = 'none';
                vendaInfoEl.textContent = '';
              }
            })
            .catch(err => { console.warn('Erro checando venda do pedido', err); vendaInfoEl.style.display = 'none'; vendaInfoEl.textContent = ''; });
        } catch (err) {
          console.warn('Erro ao atualizar info de venda no modal', err);
        }
      });
  } else {
    title.textContent = "Novo Pedido";
  }
  
  modal.classList.add("active");
}

async function loadMesasSelect() {
  try {
    const response = await fetch(`${API_URL}/mesas`);
    const mesas = await response.json();
    const select = document.getElementById("pedidoMesa");
    
    select.innerHTML = '<option value="">Selecione...</option>';
    // opção para viagem
    const viagemOpt = document.createElement("option");
    viagemOpt.value = "viagem";
    viagemOpt.textContent = "Pedido para viagem";
    select.appendChild(viagemOpt);
    // Listar apenas mesas livres para seleção ao criar/editar pedido
    const mesasLivres = mesas.filter(m => m.status === 'livre');
    mesasLivres.forEach(mesa => {
      const option = document.createElement("option");
      option.value = mesa.id_mesa;
      option.textContent = `Mesa ${mesa.numero_mesa} - ${mesa.status}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar mesas:", error);
  }
}

async function loadAtendentesSelect() {
  try {
    const response = await fetch(`${API_URL}/atendentes`);
    const atendentes = await response.json();
    const select = document.getElementById("pedidoAtendente");
    
    select.innerHTML = '<option value="">Selecione...</option>';
    atendentes.forEach(atendente => {
      const option = document.createElement("option");
      option.value = atendente.id_atendente;
      option.textContent = atendente.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar atendentes:", error);
  }
}

async function editPedido(id) {
  openPedidoModal(id);
}

document.getElementById("pedidoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = document.getElementById("pedidoId").value;
  const data = {
    id_mesa: (function(){ const v = document.getElementById("pedidoMesa").value; return v === 'viagem' ? null : (v ? parseInt(v) : null); })(),
    id_atendente: (function(){ const v = document.getElementById("pedidoAtendente").value; return v ? parseInt(v) : null; })(),
    status: document.getElementById("pedidoStatus").value,
    total: parseFloat(document.getElementById("pedidoTotal").value),
    observacoes: document.getElementById("pedidoObservacoes").value
  };
  
  // Validação: ao criar um novo pedido, exigir seleção de atendente
  if (!id) {
    const atendSel = document.getElementById("pedidoAtendente").value;
    if (!atendSel) {
      showAlert('Selecione um atendente ao criar um novo pedido', 'error');
      return;
    }
  }
  
  try {
    const url = id ? `${API_URL}/pedidos/${id}` : `${API_URL}/pedidos`;
    const method = id ? "PUT" : "POST";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      showAlert(error?.message || "Erro ao salvar pedido", "error");
      return;
    }

    const respJson = await response.json();
    const vendaCriada = respJson?.vendaCriada || respJson?.novo?.vendaCriada || respJson?.result?.vendaCriada || null;

    if (vendaCriada) {
      showAlert('Pedido atualizado e Venda registrada com sucesso!', 'success');
      closeModal('pedidoModal');
      loadPedidos();
      loadVendas();
      // ativa a aba Vendas
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const vendasLink = document.querySelector('.nav-link[data-section="vendas"]');
      if (vendasLink) vendasLink.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      const vendasSection = document.getElementById('vendas');
      if (vendasSection) vendasSection.classList.add('active');
    } else {
      showAlert(id ? 'Pedido atualizado com sucesso!' : 'Pedido criado com sucesso!', 'success');
      closeModal('pedidoModal');
      loadPedidos();
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert(error.message || "Erro ao salvar pedido", "error");
  }
});

async function deletePedido(id) {
  if (!confirm("Tem certeza que deseja excluir este pedido?")) return;
  
  try {
    const response = await fetch(`${API_URL}/pedidos/${id}`, { method: "DELETE" });
    
    if (response.ok) {
      showAlert("Pedido excluído com sucesso!", "success");
      loadPedidos();
    } else {
      showAlert("Erro ao excluir pedido", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao excluir pedido", "error");
  }
}

// ========== VENDAS ==========
async function loadVendas() {
  const loading = document.getElementById("loadingVendas");
  const tbody = document.getElementById("vendaTableBody");
  
  loading.classList.add("show");
  tbody.innerHTML = "";
  
  try {
    const response = await fetch(`${API_URL}/vendas`);
    const vendas = await response.json();
    
    if (vendas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">Nenhuma venda cadastrada</td></tr>';
    } else {
      vendas.forEach(venda => {
        const tr = document.createElement("tr");
        const dataHora = new Date(venda.data_hora).toLocaleString("pt-BR");
        tr.innerHTML = `
          <td>${venda.id_venda}</td>
          <td>${dataHora}</td>
          <td>#${venda.id_pedido}</td>
          <td>R$ ${parseFloat(venda.valor_total).toFixed(2)}</td>
          <td><span class="status-badge">${venda.forma_pagamento}</span></td>
          <td class="actions">
            <button class="action-btn action-delete" onclick="deleteVenda(${venda.id_venda})">🗑️ Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar vendas:", error);
    showAlert("Erro ao carregar vendas", "error");
  } finally {
    loading.classList.remove("show");
  }
}

async function openVendaModal() {
  const modal = document.getElementById("vendaModal");
  // Se o modal estiver marcado como backup/oculto, não abrir (permanece no código apenas como fallback)
  if (modal && modal.dataset && modal.dataset.backup === 'true') {
    console.warn('openVendaModal: o modal de Venda está marcado como backup e permanecerá oculto.');
    return;
  }
  const form = document.getElementById("vendaForm");
  const title = document.getElementById("vendaModalTitle");
  
  form.reset();
  document.getElementById("vendaId").value = "";
  title.textContent = "Nova Venda";
  
  // Carrega pedidos para o select
  await loadPedidosSelect();
  
  modal.classList.add("active");
}

async function loadPedidosSelect() {
  try {
    const response = await fetch(`${API_URL}/pedidos`);
    const pedidos = await response.json();
    const select = document.getElementById("vendaPedido");
    
    select.innerHTML = '<option value="">Selecione...</option>';
    pedidos.forEach(pedido => {
      const option = document.createElement("option");
      option.value = pedido.id_pedido;
      option.textContent = `Pedido #${pedido.id_pedido} - Mesa ${pedido.Mesa?.numero_mesa || "-"} - R$ ${parseFloat(pedido.total).toFixed(2)}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
  }
}

document.getElementById("vendaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const data = {
    id_pedido: parseInt(document.getElementById("vendaPedido").value),
    forma_pagamento: document.getElementById("vendaPagamento").value,
    valor_total: parseFloat(document.getElementById("vendaValor").value)
  };
  
  try {
    const response = await fetch(`${API_URL}/vendas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showAlert("Venda criada com sucesso!", "success");
      closeModal("vendaModal");
      loadVendas();
      loadDashboard(); // Atualiza dashboard
    } else {
      const error = await response.json();
      showAlert(error.message || "Erro ao salvar venda", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao salvar venda", "error");
  }
});

async function deleteVenda(id) {
  if (!confirm("Tem certeza que deseja excluir esta venda?")) return;
  
  try {
    const response = await fetch(`${API_URL}/vendas/${id}`, { method: "DELETE" });
    
    if (response.ok) {
      showAlert("Venda excluída com sucesso!", "success");
      loadVendas();
      loadDashboard(); // Atualiza dashboard
    } else {
      showAlert("Erro ao excluir venda", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro ao excluir venda", "error");
  }
}
