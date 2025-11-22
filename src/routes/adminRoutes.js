const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/backup', adminController.backup);
router.get('/backup/download', adminController.download);
router.get('/backups', adminController.listBackups);

module.exports = router;
