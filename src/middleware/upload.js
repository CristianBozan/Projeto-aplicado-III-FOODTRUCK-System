// src/middleware/upload.js
// Middleware de upload com multer em memória (sem salvar disco).
// Compatível com Railway (container efêmero) + Cloudinary.

const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máx 5 MB por imagem
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Apenas imagens são permitidas (jpeg, png, webp, etc.)"));
    }
    cb(null, true);
  },
});

module.exports = upload;
