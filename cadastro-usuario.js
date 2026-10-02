// Importa a Autenticação e o Banco de Dados
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const formCadastro = document.getElementById('form-cadastro');
const inputNome = document.getElementById('nome-cadastro');
const inputEmail = document.getElementById('email-cadastro');
const inputSenha = document.getElementById('senha-cadastro');
const selectPerfil = document.getElementById('perfil-cadastro');
const btnCadastrar = document.getElementById('btn-cadastrar');

formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // O .trim() previne que a validação falhe se o usuário digitar um espaço sem querer
    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim().toLowerCase();
    const senha = inputSenha.value;
    const perfil = selectPerfil.value;

    // ==========================================
    // BLOQUEIO DE SEGURANÇA (DOMÍNIO IFB)
    // ==========================================
    if (perfil === 'Educador' && !email.endsWith('@ifb.edu.br')) {
        alert("Acesso restrito! O cadastro de educadores é exclusivo para e-mails institucionais (@ifb.edu.br)."); 
        return; 
    }

    btnCadastrar.textContent = "Criando conta na nuvem...";
    btnCadastrar.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Salva os dados extras do usuário no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            nome: nome,
            email: email,
            perfil: perfil,
            dataCadastro: new Date()
        });

        alert("Conta criada com sucesso! Faça seu login para entrar no sistema.");
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Erro ao criar conta: ", error.code);
        
        if (error.code === 'auth/email-already-in-use') {
            alert("Este e-mail já está cadastrado no sistema!");
        } else if (error.code === 'auth/weak-password') {
            alert("A senha é muito fraca. Digite pelo menos 6 caracteres.");
        } else {
            alert("Ocorreu um erro ao criar a conta. Verifique sua conexão e tente novamente.");
        }
        
        btnCadastrar.textContent = "Finalizar Cadastro";
        btnCadastrar.disabled = false;
    }
});