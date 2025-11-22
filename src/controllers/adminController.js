const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const Atendente = require('../models/Atendente');
const Produto = require('../models/Produto');
const Mesa = require('../models/Mesa');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const Venda = require('../models/Venda');

module.exports = {
  async backup(req, res) {
    try {
      // Se solicitado modo SQL (mysqldump), tenta gerar dump SQL com mysqldump
      const mode = (req.query.mode || (req.body && req.body.mode) || '').toLowerCase();
      if (mode === 'sql') {
        // Verifica variáveis de ambiente necessárias
        const DB_NAME = process.env.DB_NAME;
        const DB_USER = process.env.DB_USER;
        const DB_PASS = process.env.DB_PASS;
        const DB_HOST = process.env.DB_HOST || 'localhost';
        const DB_PORT = process.env.DB_PORT || '3306';

        if (!DB_NAME || !DB_USER || !DB_PASS) {
          return res.status(400).json({ message: 'Variáveis de ambiente DB_NAME, DB_USER e DB_PASS são necessárias para gerar dump SQL' });
        }

        // prepara pasta de backups
        const backupsDir = path.join(__dirname, '..', '..', 'backups');
        if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outFilename = `backup-sql-${timestamp}.sql.gz`;
        const outPath = path.join(backupsDir, outFilename);

        // Gera dump via mysqldump e comprime com gzip (usa MYSQL_PWD no env para não expor senha em args)
        const { spawn } = require('child_process');
        const args = ['-h', DB_HOST, '-P', DB_PORT, '-u', DB_USER, DB_NAME];

        await new Promise((resolve, reject) => {
          try {
            const proc = spawn('mysqldump', args, { env: { ...process.env, MYSQL_PWD: DB_PASS } });
            const gzip = zlib.createGzip();
            const outStream = fs.createWriteStream(outPath);

            proc.stdout.pipe(gzip).pipe(outStream);

            let stderr = '';
            proc.stderr.on('data', (c) => stderr += c.toString());

            proc.on('error', (err) => reject(err));
            outStream.on('finish', () => {
              if (stderr) {
                // mysqldump may output warnings to stderr; include but don't fail on common warnings
                console.warn('mysqldump stderr:', stderr);
              }
              resolve();
            });
            outStream.on('error', (err) => reject(err));
          } catch (err) {
            reject(err);
          }
        });

        return res.json({ message: 'Dump SQL criado com sucesso', file: path.relative(process.cwd(), outPath) });
      }
      // monta objeto com todas as tabelas relevantes
      const [atendentesRows, produtosRows, mesasRows, pedidosRows, itensRows, vendasRows] = await Promise.all([
        Atendente.findAll(),
        Produto.findAll(),
        Mesa.findAll(),
        Pedido.findAll({ include: [Mesa, Atendente] }),
        ItemPedido.findAll({ include: [Produto] }),
        Venda.findAll()
      ]);

      // converte instâncias do Sequelize para objetos puros
      const atendentes = atendentesRows.map(r => (typeof r.toJSON === 'function' ? r.toJSON() : r));
      const produtos = produtosRows.map(r => (typeof r.toJSON === 'function' ? r.toJSON() : r));
      const mesas = mesasRows.map(r => (typeof r.toJSON === 'function' ? r.toJSON() : r));
      const pedidos = pedidosRows.map(r => (typeof r.toJSON === 'function' ? r.toJSON() : r));
      const itens = itensRows.map(r => (typeof r.toJSON === 'function' ? r.toJSON() : r));
      const vendas = vendasRows.map(r => (typeof r.toJSON === 'function' ? r.toJSON() : r));

      const payload = {
        generated_at: new Date().toISOString(),
        atendentes,
        produtos,
        mesas,
        pedidos,
        itens,
        vendas
      };

      // prepara pasta de backups na raiz do projeto
      const backupsDir = path.join(__dirname, '..', '..', 'backups');
      if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;
      const filepath = path.join(backupsDir, filename);

      // escreve JSON e comprime com gzip
      const json = JSON.stringify(payload, null, 2);
      const gzipBuffer = zlib.gzipSync(Buffer.from(json, 'utf8'));
      const outPath = filepath + '.gz';
      fs.writeFileSync(outPath, gzipBuffer);

      return res.json({ message: 'Backup criado com sucesso', file: path.relative(process.cwd(), outPath) });
    } catch (err) {
      console.error('Erro ao criar backup:', err);
      return res.status(500).json({ message: 'Erro ao criar backup', error: err.message });
    }
  },
  async download(req, res) {
    try {
      const file = req.query.file;
      if (!file) return res.status(400).json({ message: 'Parâmetro file é obrigatório' });

      const backupsDir = path.join(__dirname, '..', '..', 'backups');
      const safePath = path.join(backupsDir, path.basename(file)); // evita traversal

      if (!fs.existsSync(safePath)) return res.status(404).json({ message: 'Arquivo não encontrado' });

      return res.download(safePath);
    } catch (err) {
      console.error('Erro ao enviar backup para download:', err);
      return res.status(500).json({ message: 'Erro ao enviar arquivo', error: err.message });
    }
  },

  async listBackups(req, res) {
    try {
      const backupsDir = path.join(__dirname, '..', '..', 'backups');
      if (!fs.existsSync(backupsDir)) return res.json({ backups: [] });

      const files = fs.readdirSync(backupsDir).filter(f => fs.statSync(path.join(backupsDir, f)).isFile());

      const list = files.map(f => {
        const full = path.join(backupsDir, f);
        const s = fs.statSync(full);
        return {
          name: f,
          size: s.size,
          mtime: s.mtime,
          downloadUrl: `/admin/backup/download?file=${encodeURIComponent(f)}`
        };
      }).sort((a,b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());

      return res.json({ backups: list });
    } catch (err) {
      console.error('Erro ao listar backups:', err);
      return res.status(500).json({ message: 'Erro ao listar backups', error: err.message });
    }
  }
};
