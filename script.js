import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

let perfilSelecionado = 'Educador'; // Padrão
const cartoes = document.querySelectorAll('.cartao-perfil');

cartoes.forEach(cartao => {
    cartao.addEventListener('click', () => {
        cartoes.forEach(c => c.classList.remove('ativo'));
        cartao.classList.add('ativo');
        
        const nomePerfil = cartao.textContent;
        perfilSelecionado = nomePerfil.includes('Educador') ? 'Educador' : 'Familiar';
    });
});

const inputEmail = document.querySelector('input[type="email"]');
const inputSenha = document.querySelector('input[type="password"]');
const btnEntrar = document.querySelector('.btn-entrar');

function verificarCampos() {
    if (inputEmail.value !== '' && inputSenha.value !== '') {
        btnEntrar.disabled = false;
    } else {
        btnEntrar.disabled = true;
    }
}

inputEmail.addEventListener('input', verificarCampos);
inputSenha.addEventListener('input', verificarCampos);

btnEntrar.addEventListener('click', async (evento) => {
    evento.preventDefault(); 
    
    const email = inputEmail.value.trim().toLowerCase();
    const senha = inputSenha.value;

    // ==========================================
    // 1. A MÁGICA: VERIFICAÇÃO DO ADMIN MÁSTER
    // ==========================================
    const EMAIL_ADMIN = 'admin@ifb.edu.br'; //senha: 40028922
    if (email === EMAIL_ADMIN) {
        btnEntrar.textContent = "Autenticando Gestão...";
        btnEntrar.disabled = true;
        
        try {
            await signInWithEmailAndPassword(auth, email, senha);
            localStorage.setItem('perfilLogado', 'Administrador'); // Trava de segurança exclusiva
            window.location.href = 'painel-admin.html'; // Rota secreta
            return; 
        } catch (error) {
            alert("Acesso negado para a gestão! Senha incorreta.");
            inputSenha.value = '';
            verificarCampos();
            btnEntrar.textContent = "Entrar";
            return;
        }
    }

    // ==========================================
    // 2. BLOQUEIO DE SEGURANÇA (PROFESSORES)
    // ==========================================
    if (perfilSelecionado === 'Educador' && !email.endsWith('@ifb.edu.br')) {
        alert("Acesso restrito! O painel de educadores é exclusivo para e-mails institucionais (@ifb.edu.br).");
        await signOut(auth); 
        inputSenha.value = '';
        verificarCampos();
        return; 
    }

    // ==========================================
    // 3. FLUXO NORMAL (EDUCADOR OU FAMILIAR)
    // ==========================================
    btnEntrar.textContent = "Carregando...";
    btnEntrar.disabled = true;

   try {
        await signInWithEmailAndPassword(auth, email, senha);
        localStorage.setItem('perfilLogado', perfilSelecionado);

        if (perfilSelecionado === 'Educador') {
            window.location.href = 'turma.html'; 
        } 
        else if (perfilSelecionado === 'Familiar') {
            window.location.href = 'painel-familia.html'; 
        }
        
    } catch (error) {
        console.error("Erro no Firebase:", error.code);
        alert(`Acesso negado! Credenciais incorretas para o perfil.`);
        inputSenha.value = '';
        verificarCampos();
        btnEntrar.textContent = "Entrar";
    }
});