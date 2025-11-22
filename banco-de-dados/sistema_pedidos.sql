-- Cria o banco de dados
CREATE DATABASE sistema_pedidos;

-- Cria o usuário com senha padrão
CREATE USER 'foodtruck_user'@'localhost' IDENTIFIED BY '123456';

-- Concede todos os privilégios no banco criado
GRANT ALL PRIVILEGES ON sistema_pedidos.* TO 'foodtruck_user'@'localhost';

-- Atualiza as permissões
FLUSH PRIVILEGES;