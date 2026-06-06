const Produto    = require("../models/Produto");
const EstoqueLog = require("../models/EstoqueLog");
const { Op } = require("sequelize");
const cloudinary = require("cloudinary").v2;

// Configura Cloudinary a partir das variáveis de ambiente.
// Se as variáveis não estiverem definidas, upload de arquivo ficará desabilitado
// e o campo foto continuará aceitando URLs textuais (retrocompatibilidade).
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
}

/**
 * Faz upload do buffer (multer memoryStorage) para o Cloudinary.
 * Retorna a URL pública segura (https) da imagem.
 */
async function uploadParaCloudinary(buffer, folder = "foodtruck/produtos") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

module.exports = {
  // ─── LISTAR ────────────────────────────────────────────────────────────────
  async listar(req, res) {
    try {
      const { search } = req.query;
      let where = {};

      if (search && search.trim() !== "") {
        const term = `%${search.trim()}%`;
        where = {
          [Op.or]: [
            { nome:      { [Op.like]: term } },
            { categoria: { [Op.like]: term } },
            { descricao: { [Op.like]: term } },
          ],
        };
      }

      let produtos = await Produto.findAll({ where });

      // Deduplicar por id_produto (proteção contra joins extras)
      const seen  = new Set();
      const unique = [];
      produtos.forEach((p) => {
        const id = p.id_produto ?? p.dataValues?.id_produto;
        if (!seen.has(id)) { seen.add(id); unique.push(p); }
      });


      res.json(unique);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ─── BUSCAR POR ID ─────────────────────────────────────────────────────────
  async buscarPorId(req, res) {
    try {
      const produto = await Produto.findByPk(req.params.id);
      if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(produto);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ─── CRIAR ─────────────────────────────────────────────────────────────────
  async criar(req, res) {
    try {
      let fotoUrl = req.body.foto || null;

      // Se veio arquivo via multer, faz upload para Cloudinary
      if (req.file) {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
          return res.status(500).json({
            error: "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET nas variáveis de ambiente.",
          });
        }
        fotoUrl = await uploadParaCloudinary(req.file.buffer);
      }

      const dados = { ...req.body, foto: fotoUrl };
      const novo  = await Produto.create(dados);
      res.status(201).json(novo);
    } catch (err) {
      console.error("ERRO POST /produtos:", err.message, err.http_code || "");
      res.status(500).json({ error: err.message });
    }
  },

  // ─── ATUALIZAR ─────────────────────────────────────────────────────────────
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados   = { ...req.body };

      // Se veio arquivo via multer, faz upload para Cloudinary
      if (req.file) {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
          return res.status(500).json({
            error: "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET nas variáveis de ambiente.",
          });
        }
        dados.foto = await uploadParaCloudinary(req.file.buffer);
      }
      // Se não veio arquivo e não veio foto textual, não altera o campo foto
      // (evita sobrescrever URL existente com null)
      if (!req.file && dados.foto === undefined) {
        delete dados.foto;
      }

      const produtoAtual = await Produto.findByPk(id);
      if (!produtoAtual) return res.status(404).json({ message: "Produto não encontrado" });

      const estoqueAntes = produtoAtual.quantidade_estoque;
      const [atualizado] = await Produto.update(dados, { where: { id_produto: id } });
      if (!atualizado) return res.status(404).json({ message: "Produto não encontrado" });

      // Registra ajuste de estoque se a quantidade mudou
      if (dados.quantidade_estoque !== undefined && parseInt(dados.quantidade_estoque) !== estoqueAntes) {
        const estoqueDepois = parseInt(dados.quantidade_estoque);
        await EstoqueLog.create({
          id_produto: parseInt(id),
          acao: 'ajuste',
          quantidade_anterior: estoqueAntes,
          quantidade_nova: estoqueDepois,
          nota: `Ajuste manual de estoque`
        });
      }

      res.json({ message: "Produto atualizado com sucesso" });
    } catch (err) {
      console.error(`ERRO PUT /produtos/${req.params.id}:`, err.message, err.http_code || "");
      res.status(500).json({ error: err.message });
    }
  },

  // ─── DELETAR ───────────────────────────────────────────────────────────────
  async deletar(req, res) {
    try {
      const { id }  = req.params;
      const deletado = await Produto.destroy({ where: { id_produto: id } });
      if (!deletado) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ message: "Produto removido com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
