USE sistema_pedidos;

INSERT INTO atendentes (nome, cpf, telefone, login, senha, tipo_usuario)
VALUES ('Admin', '12345678901', '47999999999', 'admin', 'admin123', 'gerente');

INSERT INTO mesas (numero_mesa, status) VALUES (1, 'livre'), (2, 'livre');

INSERT INTO produtos (nome, descricao, preco, categoria, quantidade_estoque)
VALUES 
  ('X-Burger', 'Hambúrguer artesanal', 20.00, 'Lanche', 50),
  ('Refrigerante Lata', '350ml', 6.00, 'Bebida', 100);
