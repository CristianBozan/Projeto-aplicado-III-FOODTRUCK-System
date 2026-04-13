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

      const GERENTE_LOGIN   = process.env.GERENTE_LOGIN   || 'admin';
      const GERENTE_SENHA   = process.env.GERENTE_SENHA   || 'admin123';
      const ATENDENTE_LOGIN = process.env.ATENDENTE_LOGIN || 'funcionario';
      const ATENDENTE_SENHA = process.env.ATENDENTE_SENHA || 'func123';

      let role = null;
      let nome = null;

      if (username === GERENTE_LOGIN && password === GERENTE_SENHA) {
        role = 'gerente';
        nome = 'Administrador';
      } else if (username === ATENDENTE_LOGIN && password === ATENDENTE_SENHA) {
        role = 'atendente';
        nome = 'Funcionário';
      }

      if (!role) {
        return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }

      const token = jwt.sign({ username, role, nome }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      return res.json({
        success: true,
        token,
        role,
        nome,
        message: `Autenticado como ${role === 'gerente' ? 'Gerente' : 'Atendente'}`
      });
    } catch (err) {
      console.error('Erro em auth.login:', err);
      return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
  }
};
