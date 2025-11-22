const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const requireBackupAuth = require('../middleware/requireBackupAuth');

// POST /backups -> criar backup manual (body: { nome: 'opcional' })
router.post('/', requireBackupAuth, backupController.criar);

// GET /backups -> listar backups
router.get('/', requireBackupAuth, backupController.listar);

// GET /backups/:id -> ver backup
router.get('/:id', requireBackupAuth, backupController.buscarPorId);

// GET /backups/:id/download -> download .json
router.get('/:id/download', requireBackupAuth, backupController.download);

// GET /backups/:id/excel -> gerar/baixar excel
router.get('/:id/excel', requireBackupAuth, backupController.excel);

// POST /backups/:id/restore -> restaurar backup (body: { mode: 'safe'|'force' })
router.post('/:id/restore', requireBackupAuth, backupController.restore);
router.get('/:id/excel', backupController.excel);

// POST /backups/:id/restore -> restaurar backup (body: { mode: 'safe'|'force' })
router.post('/:id/restore', backupController.restore);

module.exports = router;
