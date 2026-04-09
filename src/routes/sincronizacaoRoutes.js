const express = require("express");
const router = express.Router();
const sincronizacaoController = require("../controllers/sincronizacaoController");

router.get("/", sincronizacaoController.listar);
router.get("/:id", sincronizacaoController.buscarPorId);
router.post("/", sincronizacaoController.criar);
router.get("/atendente/:id_atendente", sincronizacaoController.listarPorAtendente);

module.exports = router;
