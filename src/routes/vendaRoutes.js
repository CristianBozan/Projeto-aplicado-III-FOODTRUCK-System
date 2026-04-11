const express = require("express");
const router = express.Router();
const vendaController = require("../controllers/vendaController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.use(requireAuth);

router.get("/",    vendaController.listar);
router.get("/:id", vendaController.buscarPorId);
router.post("/",   vendaController.criar);
router.delete("/:id", requireRole('gerente'), vendaController.deletar);

module.exports = router;
