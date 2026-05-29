// src/routes/produtoRoutes.js
const express           = require("express");
const router            = express.Router();
const produtoController = require("../controllers/produtoController");
const requireAuth       = require("../middleware/requireAuth");
const requireRole       = require("../middleware/requireRole");
const upload            = require("../middleware/upload");

router.use(requireAuth);

// Leitura: todos os usuários autenticados
router.get("/",    produtoController.listar);
router.get("/:id", produtoController.buscarPorId);

// Escrita: somente gerente
// upload.single("foto") aceita multipart/form-data com campo "foto".
// Se nenhum arquivo for enviado (só JSON), req.file fica undefined
// e o controller usa req.body.foto (URL textual) como fallback — retrocompatível.
router.post("/",      requireRole("gerente"), upload.single("foto"), produtoController.criar);
router.put("/:id",    requireRole("gerente"), upload.single("foto"), produtoController.atualizar);
router.delete("/:id", requireRole("gerente"), produtoController.deletar);

module.exports = router;
