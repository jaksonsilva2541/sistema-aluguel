const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Importação direta do mysql2
const app = express();

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',          // Substitua pelo seu usuário MySQL
  password: '',          // Substitua pela senha do MySQL
  database: 'sistema_aluguel', // Substitua pelo nome do seu banco
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criação do pool de conexões
const pool = require('./db');

// Middlewares essenciais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de login corrigida
app.post('/api/login', async (req, res) => {
  console.log('Requisição de login recebida:', {
    headers: req.headers,
    body: req.body
  });

  try {
    // Validação dos dados
    if (!req.body || !req.body.email || !req.body.senha) {
      return res.status(400).json({ 
        error: 'Dados incompletos',
        details: 'E-mail e senha são obrigatórios'
      });
    }

    const { email, senha } = req.body;

    // Obter conexão do pool
    const connection = await pool.getConnection();
    
    try {
      // Consulta ao banco de dados
      const [rows] = await connection.query(
        `SELECT id, nome, email, avatar_iniciais 
         FROM usuarios 
         WHERE email = ? AND senha = ?`,
        [email.trim(), senha.trim()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas',
          details: 'Nenhum usuário encontrado com essas credenciais'
        });
      }

      // Formata resposta
      const user = {
        id: rows[0].id,
        name: rows[0].nome,
        email: rows[0].email,
        avatarInitials: rows[0].avatar_iniciais
      };

      console.log('Login bem-sucedido para:', user.email);
      return res.json(user);

    } finally {
      // Liberar conexão de volta para o pool
      connection.release();
    }

  } catch (error) {
    console.error('Erro durante o login:', {
      message: error.message,
      stack: error.stack,
      sqlMessage: error.sqlMessage || 'N/A'
    });

    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota para obter veículos
app.get('/api/veiculos/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [alugueis] = await connection.query(`
        SELECT a.id, a.data_inicio, a.data_fim, a.valor_mensal, a.status,
               v.id as veiculo_id, v.modelo, v.marca, v.ano, v.placa, v.imagem_url
        FROM alugueis a
        JOIN veiculos v ON a.veiculo_id = v.id
        WHERE a.usuario_id = ? AND a.status = 'ativo'
      `, [usuarioId]);

      // Processar resultados...
      const veiculos = await Promise.all(alugueis.map(async aluguel => {
        const [pagamentos] = await connection.query(`
          SELECT id, descricao, numero_fatura, data_vencimento, valor, 
                 metodo_pagamento, data_pagamento, status
          FROM pagamentos
          WHERE aluguel_id = ?
        `, [aluguel.id]);

        return {
          id: aluguel.veiculo_id,
          brand: aluguel.marca,
          model: aluguel.modelo,
          year: aluguel.ano,
          plate: aluguel.placa,
          image: aluguel.imagem_url,
          status: aluguel.status === 'ativo' ? 'active' : 'inactive',
          rentalStart: aluguel.data_inicio.toISOString().split('T')[0],
          rentalEnd: aluguel.data_fim.toISOString().split('T')[0],
          payments: pagamentos.map(p => ({
            id: p.id,
            description: p.descricao,
            invoiceNumber: p.numero_fatura,
            dueDate: p.data_vencimento.toISOString().split('T')[0],
            amount: parseFloat(p.valor),
            status: p.status,
            paidDate: p.data_pagamento?.toISOString().split('T')[0],
            paymentMethod: p.metodo_pagamento,
            lateFee: 0,
            discount: 0
          }))
        };
      }));

      res.json(veiculos);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para processar pagamento
app.post('/api/pagamentos/:pagamentoId', async (req, res) => {
  try {
    const { pagamentoId } = req.params;
    const { metodo } = req.body;
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(`
        UPDATE pagamentos 
        SET status = 'pago', 
            metodo_pagamento = ?, 
            data_pagamento = CURRENT_DATE()
        WHERE id = ?
      `, [metodo, pagamentoId]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }
      
      res.json({
        success: true,
        pagamentoId,
        metodo,
        dataPagamento: new Date().toISOString().split('T')[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de health check
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.ping();
      res.json({ 
        status: 'online',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'online',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Testando conexão com o banco de dados...');
  
  pool.getConnection()
    .then(conn => {
      console.log('✅ Conexão com o banco estabelecida com sucesso');
      conn.release();
    })
    .catch(err => {
      console.error('❌ Falha ao conectar ao banco:', err.message);
    });
});