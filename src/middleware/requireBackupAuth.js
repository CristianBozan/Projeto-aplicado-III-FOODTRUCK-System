// Middleware simples para proteger rotas de backup
// Verifica o token em env BACKUP_TOKEN. Se não configurado, libera (modo permissivo).
module.exports = function requireBackupAuth(req, res, next) {
  try {
    const required = process.env.BACKUP_TOKEN;
    if (!required) return next(); // sem token configurado, permite (desenv)

    // aceita em Authorization: Bearer <token>
    const auth = req.get('authorization');
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7).trim();
      if (token === required) return next();
    }

    // aceita header customizado x-backup-token
    const header = req.get('x-backup-token');
    if (header && header === required) return next();

    // ou token via query ?token=...
    if (req.query && req.query.token && req.query.token === required) return next();

    return res.status(401).json({ message: 'Unauthorized: backup token missing or invalid' });
  } catch (err) {
    return res.status(500).json({ message: 'Auth middleware error' });
  }
};
