const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const porta = 3000
const app = express()

const conexao = require('./db.js'); 


app.use(cors())


app.use(express.json())


app.post("/contatos", async (req, res) => {
    
    const { nome, email, assunto, mensagem, telefone } = req.body

    console.log("Dados recebidos:", req.body)

    try {
        // 1. Validação dos Campos Obrigatórios

        if (!nome || nome.length < 3) {
            return res.status(400).json({ "resposta": "O nome deve ter pelo menos 3 caracteres." });
        }

        if (!email || email.length < 6 || !email.includes('@')) {
            return res.status(400).json({ "resposta": "Preencha um e-mail válido." });
        }
        if (!mensagem || mensagem.length < 10) {
            return res.status(400).json({ "resposta": "A mensagem deve ter pelo menos 10 caracteres." });
        }

        
        let sqlVerificar = `SELECT * FROM contatos WHERE email = ?`;
        let [resultadoVerificar] = await conexao.query(sqlVerificar, [email]);
        
        
        if (resultadoVerificar.length !== 0) {
           
             console.log(`Aviso: E-mail ${email} já cadastrado. Prosseguindo com novo registro.`);
        }
        
        
        
        let sqlInserir = (`INSERT INTO contatos (nome, email, assunto, mensagem, telefone) VALUES (?, ?, ?, ?, ?)`);
        const valores = [nome, email, assunto, mensagem, telefone || null]; // Telefone pode ser NULL
        
        const [resultadoInserir] = await conexao.query(sqlInserir, valores);
        
        // 4. Resposta de Sucesso
        
        return res.status(201).json({ 
            "resposta": "Mensagem enviada com sucesso!",
            "id_contato": resultadoInserir.insertId
        });

    } catch (error) {
        console.error("Erro ao processar o contato:", error);
        // Em caso de erro interno, retorna 500
        return res.status(500).json({ 
            "resposta": "Erro interno do servidor.",
            "detalhe": error.message // Útil para depuração, mas pode ser removido em produção
        });
    }
});



app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});