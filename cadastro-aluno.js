import { db, auth } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const form = document.getElementById('form-cadastro');
const inputNome = document.getElementById('nome-aluno');
const inputMatricula = document.getElementById('matricula-aluno');
const inputNeuro = document.getElementById('neuro-aluno');
const inputEmailFamiliar = document.getElementById('email-familiar');
const btnSalvar = document.getElementById('btn-salvar');

const turmaAtual = localStorage.getItem('turma_selecionada');

if (!turmaAtual) {
    window.location.href = 'turma.html';
}

form.addEventListener('submit', async (evento) => {
    evento.preventDefault(); 
    
    btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando na nuvem...';
    btnSalvar.disabled = true;
    
    try {
        await addDoc(collection(db, "alunos"), {
            nome: inputNome.value,
            matricula: inputMatricula.value,
            neurodivergencia: inputNeuro.value,
            turma: turmaAtual, 
            emailFamiliar: inputEmailFamiliar.value,
            dataCadastro: new Date()
        });
        
        window.location.href = 'lista-alunos.html';

    } catch (error) {
        console.error("Erro ao cadastrar aluno: ", error);
        alert("Ocorreu um erro ao salvar o aluno. Verifique sua conexão e tente novamente.");
        
        btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Cadastro';
        btnSalvar.disabled = false;
    }
});

// Lógica para o botão Sair do menu lateral
const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = 'index.html';
    });
}