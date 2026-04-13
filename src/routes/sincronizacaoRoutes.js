const express = require("express");
const router = express.Router();
const sincronizacaoController = require("../controllers/sincronizacaoController");
const requireAuth = require("../middleware/requireAuth");

router.get("/",                        requireAuth, sincronizacaoController.listar);
router.get("/atendente/:id_atendente", requireAuth, sincronizacaoController.listarPorAtendente);
router.get("/:id",                     requireAuth, sincronizacaoController.buscarPorId);
router.post("/",                       requireAuth, sincronizacaoController.criar);

module.exports = router;
