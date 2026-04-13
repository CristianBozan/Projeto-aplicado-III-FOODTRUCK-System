const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

// Health check — usado pelo Railway para verificar se o serviço está ativo
router.get('/ping', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

module.exports = router;
