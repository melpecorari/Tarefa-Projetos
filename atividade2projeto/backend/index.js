
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const crypto = require('crypto');


const porta = 3002; 
const app = express();


const conexao = require('./db.js'); 

app.use(cors());

app.use(express.json());



app.post("/cadastrar", async (req, res) => {
    try {
        const { email, senha } = req.body; 

       
        if (!email || !senha) {
            return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
        }
        if (senha.length < 6) {
            return res.status(400).json({ mensagem: "A senha deve ter no mínimo 6 caracteres." });
        }
        
       
        const checkSql = 'SELECT email FROM usuarios WHERE email = ?';
        const [existingUser] = await conexao.query(checkSql, [email]);

        if (existingUser.length > 0) {
            return res.status(409).json({ mensagem: "Este e-mail já está cadastrado." });
        }

        
        const hash = crypto.createHash("sha256").update(senha).digest("hex");

        
        const insertSql = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
        await conexao.query(insertSql, [email, hash]);

        
        res.status(201).json({ mensagem: "Cadastro realizado com sucesso! Faça o login." });

    } catch (error) {
        console.error("ERRO NO CADASTRO:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor ao tentar cadastrar." }); 
    }
});



app.post("/login", async (req, res) => {
    try {
        
        let { email, senha } = req.body; 

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Preencha todos os campos." }); 
        }

        
        const hash = crypto.createHash("sha256").update(senha).digest("hex");

       
        const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
        
        const [resultado] = await conexao.query(sql, [email, hash]);

        if (resultado.length > 0) {
            
            res.json({ mensagem: "Login realizado com sucesso!" });
        } else {
            
            res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
        }
    } catch (error) {
        console.error("ERRO NO PROCESSAMENTO DO LOGIN:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." }); 
    }
});



app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});