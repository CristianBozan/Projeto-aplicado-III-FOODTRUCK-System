const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const requireBackupAuth = require('../middleware/requireBackupAuth');

// Todas as rotas de backup exigem token de segurança
router.use(requireBackupAuth);

router.post('/', backupController.criar);
router.get('/', backupController.listar);
router.get('/:id', backupController.buscarPorId);
router.get('/:id/download', backupController.download);
router.get('/:id/excel', backupController.excel);
router.post('/:id/restore', backupController.restore);

module.exports = router;
