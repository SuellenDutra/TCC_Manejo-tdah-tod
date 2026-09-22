import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const form = document.getElementById('form-cadastro');
const inputNome = document.getElementById('nome-aluno');
const inputMatricula = document.getElementById('matricula-aluno');
const inputNeuro = document.getElementById('neuro-aluno');
const inputTurma = document.getElementById('turma-aluno');
const inputEmailFamiliar = document.getElementById('email-familiar');
const btnSalvar = document.getElementById('btn-salvar');

form.addEventListener('submit', async (evento) => {
    evento.preventDefault(); 
    
    btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando na nuvem...';
    btnSalvar.disabled = true;
    
    try {
        await addDoc(collection(db, "alunos"), {
            nome: inputNome.value,
            matricula: inputMatricula.value,
            neurodivergencia: inputNeuro.value,
            turma: inputTurma.value,
            emailFamiliar: inputEmailFamiliar.value,
            dataCadastro: new Date()
        });
        
        window.location.href = 'turma.html';

    } catch (error) {
        console.error("Erro ao cadastrar aluno: ", error);
        alert("Ocorreu um erro ao salvar o aluno. Verifique sua conexão e tente novamente.");
        
        btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Cadastro';
        btnSalvar.disabled = false;
    }
});