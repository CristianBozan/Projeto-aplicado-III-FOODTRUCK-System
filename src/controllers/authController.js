const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Atendente = require('../models/Atendente');

const JWT_SECRET = process.env.JWT_SECRET || 'foodtruck_secret_dev';
const JWT_EXPIRES = '12h';

function gerarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
      }

      // 1. Verifica login de gerente fixo (via .env)
      const GERENTE_LOGIN = process.env.GERENTE_LOGIN || 'admin';
      const GERENTE_SENHA = process.env.GERENTE_SENHA || 'admin123';

      if (username === GERENTE_LOGIN && password === GERENTE_SENHA) {
        const token = gerarToken({ userId: null, role: 'gerente', nome: 'Administrador' });
        return res.json({
          success: true,
          token,
          role: 'gerente',
          nome: 'Administrador',
          userId: null,
          message: 'Autenticado como Gerente'
        });
      }

      // 2. Verifica atendentes cadastrados no banco
      const atendente = await Atendente.findOne({ where: { login: username } });

      if (!atendente) {
        return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }

      const senhaCorreta = await bcrypt.compare(password, atendente.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }

      const role = atendente.tipo_usuario || 'atendente';
      const token = gerarToken({ userId: atendente.id_atendente, role, nome: atendente.nome });

      return res.json({
        success: true,
        token,
        role,
        nome: atendente.nome,
        userId: atendente.id_atendente,
        message: `Autenticado como ${role === 'gerente' ? 'Gerente' : 'Atendente'}`
      });

    } catch (err) {
      console.error('Erro em auth.login:', err);
      return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
  }
};
