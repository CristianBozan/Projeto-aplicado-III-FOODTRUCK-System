const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body || {};
      const ADMIN_USER = process.env.AUTH_USER || 'admin';
      const ADMIN_PASS = process.env.AUTH_PASS || 'admin';

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'username and password required' });
      }

      if (username === ADMIN_USER && password === ADMIN_PASS) {
        // No real session here — frontend will store a flag in localStorage.
        return res.json({ success: true, message: 'Autenticado' });
      }

      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    } catch (err) {
      console.error('Erro em auth.login', err);
      return res.status(500).json({ success: false, message: 'Erro interno' });
    }
  }
};
