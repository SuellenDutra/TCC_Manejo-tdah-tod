import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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
    
    const email = inputEmail.value;
    const senha = inputSenha.value;

    btnEntrar.textContent = "Carregando...";
    btnEntrar.disabled = true;

   try {
        await signInWithEmailAndPassword(auth, email, senha);
        
        // NOVIDADE: Salva o perfil na memória do navegador para a trava de segurança
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