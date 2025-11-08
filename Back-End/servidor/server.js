const express = require('express');
const mysql = require('mysql2');
const PDFDocument = require('pdfkit');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '987123',
  database: 'sistema_gerenciamento'
});

const con = db.promise();

app.post('/cadastro', (req, res) => {
  const { nome_completo, nome_social, email, senha } = req.body;
  const sql = "INSERT INTO cadastro (nome_completo, nome_social, email, senha) VALUES (?, ?, ?, ?)";
  db.query(sql, [nome_completo, nome_social, email, senha], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send("Cadastro inserido com sucesso! ID: " + result.insertId);
  });
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const sql = "SELECT nome_completo FROM cadastro WHERE email = ? AND senha = ?";
  db.query(sql, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro no servidor" });
    if (results.length > 0) {
      res.json({ message: "Bem-vindo, " + results[0].nome_completo + "!" });
    } else {
      res.status(401).json({ error: "Email ou senha inválidos" });
    }
  });
});

app.post('/estoqueEntrada', (req, res) => {
  const { idProduto, quantity, location, responsible, dataEntrada, observacao } = req.body;
  const sql = "INSERT INTO estoque_entrada (produto_id, quantidade, data_entrada, fornecedor, observacao, localizacao) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [idProduto, quantity, dataEntrada, responsible, observacao, location], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send("Entrada de material inserida com sucesso! ID: " + result.insertId);
  });
});

app.post('/estoqueRetirada', (req, res) => {
  const { idProduto, quantity, location, responsible, dataEntrada, observacao } = req.body;
  const sql = "INSERT INTO estoque_saida (produto_id, quantidade, data_saida, responsavel, observacao, localizacao) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [idProduto, quantity, dataEntrada, responsible, observacao, location], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send("Retirada de material inserida com sucesso! ID: " + result.insertId);
  });
});

app.get('/gerar-pdf', async (req, res) => {
  try {
    // busca os dados
    const [rows] = await con.query(`
      SELECT id, produto_id, quantidade, fornecedor, data_entrada 
      FROM estoque_entrada 
      ORDER BY id ASC
    `);

    // cria o PDF
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_estoque.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // título
    doc.fontSize(18).text('Relatório de Entradas de Estoque', { align: 'center' });
    doc.moveDown();

    // cabeçalho
    doc.fontSize(12)
      .text('ID', 50, doc.y, { continued: true })
      .text('Produto ID', 100, doc.y, { continued: true })
      .text('Quantidade', 200, doc.y, { continued: true })
      .text('Fornecedor', 300, doc.y, { continued: true })
      .text('Data de Entrada', 450, doc.y);
    doc.moveDown();

    // linhas de dados
    rows.forEach(item => {
      doc.text(item.id.toString(), 50, doc.y, { continued: true })
         .text(item.produto_id.toString(), 100, doc.y, { continued: true })
         .text(item.quantidade.toString(), 200, doc.y, { continued: true })
         .text(item.fornecedor || '-', 300, doc.y, { continued: true })
         .text(new Date(item.data_entrada).toLocaleDateString('pt-BR'), 450, doc.y);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar PDF');
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
