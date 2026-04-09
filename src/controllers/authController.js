const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
      }

      const GERENTE_LOGIN = process.env.GERENTE_LOGIN || 'admin';
      const GERENTE_SENHA = process.env.GERENTE_SENHA || 'admin123';
      const ATENDENTE_LOGIN = process.env.ATENDENTE_LOGIN || 'funcionario';
      const ATENDENTE_SENHA = process.env.ATENDENTE_SENHA || 'func123';

      if (username === GERENTE_LOGIN && password === GERENTE_SENHA) {
        return res.json({
          success: true,
          role: 'gerente',
          nome: 'Administrador',
          message: 'Autenticado como Gerente'
        });
      }

      if (username === ATENDENTE_LOGIN && password === ATENDENTE_SENHA) {
        return res.json({
          success: true,
          role: 'atendente',
          nome: 'Funcionário',
          message: 'Autenticado como Atendente'
        });
      }

      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    } catch (err) {
      console.error('Erro em auth.login:', err);
      return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
  }
};
