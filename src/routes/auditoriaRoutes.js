const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(requireAuth);
router.use(requireRole('gerente'));

router.get('/', auditoriaController.listar);

module.exports = router;
