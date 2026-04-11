const express = require("express");
const router = express.Router();
const sincronizacaoController = require("../controllers/sincronizacaoController");
const requireAuth = require("../middleware/requireAuth");

// Sincronização acessível a todos os usuários autenticados
router.use(requireAuth);

router.get("/",                          sincronizacaoController.listar);
router.get("/:id",                       sincronizacaoController.buscarPorId);
router.post("/",                         sincronizacaoController.criar);
router.get("/atendente/:id_atendente",   sincronizacaoController.listarPorAtendente);

module.exports = router;
