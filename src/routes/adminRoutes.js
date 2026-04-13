const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.post('/backup',          requireAuth, requireRole('gerente'), adminController.backup);
router.get('/backup/download',  requireAuth, requireRole('gerente'), adminController.download);
router.get('/backups',          requireAuth, requireRole('gerente'), adminController.listBackups);

module.exports = router;
