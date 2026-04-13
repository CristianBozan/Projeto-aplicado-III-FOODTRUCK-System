const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

const JWT_SECRET  = process.env.JWT_SECRET  || 'foodtruck_secret_dev';
const JWT_EXPIRES = process.env.JWT_EXPIRES  || '8h';

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
      }

      // Credenciais por papel — definidas via variáveis de ambiente
      const ADMIN_LOGIN     = process.env.ADMIN_LOGIN     || 'superadmin';
      const ADMIN_SENHA     = process.env.ADMIN_SENHA     || 'super123';
      const GERENTE_LOGIN   = process.env.GERENTE_LOGIN   || 'admin';
      const GERENTE_SENHA   = process.env.GERENTE_SENHA   || 'admin123';
      const ATENDENTE_LOGIN = process.env.ATENDENTE_LOGIN || 'funcionario';
      const ATENDENTE_SENHA = process.env.ATENDENTE_SENHA || 'func123';

      let role = null;
      let nome = null;

      if (username === ADMIN_LOGIN && password === ADMIN_SENHA) {
        role = 'admin';
        nome = 'Super Admin';
      } else if (username === GERENTE_LOGIN && password === GERENTE_SENHA) {
        role = 'gerente';
        nome = 'Gerente';
      } else if (username === ATENDENTE_LOGIN && password === ATENDENTE_SENHA) {
        role = 'atendente';
        nome = 'Atendente';
      }

      if (!role) {
        return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }

      const token = jwt.sign({ username, role, nome }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      const roleLabel = { admin: 'Super Admin', gerente: 'Gerente', atendente: 'Atendente' }[role];
      return res.json({
        success: true,
        token,
        role,
        nome,
        message: `Autenticado como ${roleLabel}`
      });
    } catch (err) {
      console.error('Erro em auth.login:', err);
      return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
  }
};
