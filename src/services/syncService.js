/**
 * syncService.js
 * Serviço de sincronização e backup — separado do controller para reuso.
 * Usado pelo cron automático (app.js) e pelo endpoint manual (/backups).
 */

const backupController = require('../controllers/backupController');

/**
 * Executa um backup completo do sistema.
 * @param {string|null} nome - Nome personalizado do backup (opcional)
 * @returns {Promise<object>} Registro do backup criado
 */
async function executarBackup(nome = null) {
  const nomeBackup = nome || gerarNomePadrao();
  const backup = await backupController.createBackup(nomeBackup);
  return backup;
}

/**
 * Gera nome padrão de backup no formato BKP_DD_MM_YYYY
 */
function gerarNomePadrao(date = new Date()) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `BKP_${d}_${m}_${y}`;
}

/**
 * Registra log de sincronização no console com timestamp.
 * Pode ser expandido para gravar em tabela de logs futuramente.
 */
function registrarLog(status, detalhes = '') {
  const ts = new Date().toISOString();
  if (status === 'sucesso') {
    console.log(`[syncService] ${ts} — Backup concluído: ${detalhes}`);
  } else {
    console.error(`[syncService] ${ts} — Falha no backup: ${detalhes}`);
  }
}

/**
 * Backup automático — chamado pelo cron em app.js às 05:00.
 */
async function backupAutomatico() {
  try {
    const backup = await executarBackup();
    registrarLog('sucesso', `id=${backup.id_backup}, nome=${backup.nome}`);
    return backup;
  } catch (err) {
    registrarLog('erro', err.message);
    throw err;
  }
}

module.exports = { executarBackup, backupAutomatico, gerarNomePadrao };
