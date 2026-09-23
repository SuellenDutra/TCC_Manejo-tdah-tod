import { db } from './firebase-config.js';
// Adicionamos getDocs, query e orderBy para poder buscar as turmas
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const form = document.getElementById('form-cadastro');
const inputNome = document.getElementById('nome-aluno');
const inputMatricula = document.getElementById('matricula-aluno');
const inputNeuro = document.getElementById('neuro-aluno');
const inputTurma = document.getElementById('turma-aluno');
const inputEmailFamiliar = document.getElementById('email-familiar');
const btnSalvar = document.getElementById('btn-salvar');

// 1. FUNÇÃO NOVA: BUSCAR TURMAS DA NUVEM PARA A CAIXINHA DE SELEÇÃO
async function carregarTurmasNoSelect() {
    try {
        inputTurma.innerHTML = '<option value="">Carregando turmas da nuvem...</option>';
        
        const turmasQuery = query(collection(db, "turmas"), orderBy("nome"));
        const snapshot = await getDocs(turmasQuery);

        inputTurma.innerHTML = ''; // Limpa o "Carregando..."

        if (snapshot.empty) {
            // Se não tiver turma cadastrada, avisa e bloqueia o botão de matricular
            inputTurma.innerHTML = '<option value="" disabled selected>Nenhuma turma cadastrada no sistema.</option>';
            btnSalvar.disabled = true; 
            btnSalvar.innerHTML = '<i class="fa-solid fa-lock"></i> Cadastre uma turma primeiro';
            return;
        }

        // Opção padrão
        inputTurma.innerHTML = '<option value="" disabled selected>Selecione a turma do aluno</option>';

        // Para cada turma achada na nuvem, cria uma opção no select
        snapshot.forEach(doc => {
            const turma = doc.data();
            const option = document.createElement('option');
            option.value = turma.nome; 
            option.textContent = turma.nome; 
            inputTurma.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar turmas: ", error);
        inputTurma.innerHTML = '<option value="" disabled selected>Erro de conexão</option>';
    }
}

// Carrega as turmas assim que a tela de cadastro abre
carregarTurmasNoSelect();


// 2. FUNÇÃO DE SALVAR O ALUNO (MANTIDA INTACTA)
form.addEventListener('submit', async (evento) => {
    evento.preventDefault(); 
    
    btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando na nuvem...';
    btnSalvar.disabled = true;
    
    try {
        await addDoc(collection(db, "alunos"), {
            nome: inputNome.value,
            matricula: inputMatricula.value,
            neurodivergencia: inputNeuro.value,
            turma: inputTurma.value, // Agora salva a turma real escolhida na caixinha!
            emailFamiliar: inputEmailFamiliar.value,
            dataCadastro: new Date()
        });
        
        // Volta para o painel principal
        window.location.href = 'turma.html';

    } catch (error) {
        console.error("Erro ao cadastrar aluno: ", error);
        alert("Ocorreu um erro ao salvar o aluno. Verifique sua conexão e tente novamente.");
        
        btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Cadastro';
        btnSalvar.disabled = false;
    }
});