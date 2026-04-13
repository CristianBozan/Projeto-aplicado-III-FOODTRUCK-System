const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const gerenteOnly = [requireAuth, requireRole('gerente')];

router.post('/',           ...gerenteOnly, backupController.criar);
router.get('/',            ...gerenteOnly, backupController.listar);
router.get('/:id',         ...gerenteOnly, backupController.buscarPorId);
router.get('/:id/download',...gerenteOnly, backupController.download);
router.get('/:id/excel',   ...gerenteOnly, backupController.excel);
router.post('/:id/restore',...gerenteOnly, backupController.restore);

module.exports = router;
