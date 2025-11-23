const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
// POST /backups -> criar backup manual (body: { nome: 'opcional' })
router.post('/', backupController.criar);

// GET /backups -> listar backups
router.get('/', backupController.listar);

// GET /backups/:id -> ver backup
router.get('/:id', backupController.buscarPorId);

// GET /backups/:id/download -> download .json
router.get('/:id/download', backupController.download);

// GET /backups/:id/excel -> gerar/baixar excel
router.get('/:id/excel', backupController.excel);

// POST /backups/:id/restore -> restaurar backup (body: { mode: 'safe'|'force' })
router.post('/:id/restore', backupController.restore);

module.exports = router;
