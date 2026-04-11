const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(requireAuth);
router.use(requireRole('gerente'));

router.post('/backup',          adminController.backup);
router.get('/backup/download',  adminController.download);
router.get('/backups',          adminController.listBackups);

module.exports = router;
