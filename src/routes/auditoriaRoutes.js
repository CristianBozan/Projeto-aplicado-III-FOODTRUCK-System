const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');

// GET / -> lista logs de estoque
router.get('/', auditoriaController.listar);

module.exports = router;
