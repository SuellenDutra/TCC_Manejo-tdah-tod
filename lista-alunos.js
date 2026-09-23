import { auth, db } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const gridEstudantes = document.getElementById('grid-estudantes');
const tituloTurma = document.getElementById('titulo-turma');

const turmaSelecionada = localStorage.getItem('turma_selecionada');

if (!turmaSelecionada) {
    window.location.href = 'turma.html'; 
} else {
    tituloTurma.innerHTML = `<i class="fa-solid fa-folder-open icone-titulo"></i> ${turmaSelecionada}`;
    carregarAlunosDaTurma();
}

async function carregarAlunosDaTurma() {
    try {
        const alunosQuery = query(collection(db, "alunos"), where("turma", "==", turmaSelecionada));
        const querySnapshot = await getDocs(alunosQuery);
        
        gridEstudantes.innerHTML = '';

        if (querySnapshot.empty) {
             gridEstudantes.innerHTML = `
                <div class="area-vazia">
                    <i class="fa-regular fa-face-frown-open icone-vazio"></i>
                    <p>Nenhum aluno matriculado nesta turma ainda.</p>
                </div>`;
             return;
        }

        querySnapshot.forEach((doc) => {
            const aluno = doc.data();
            aluno.id = doc.id; 

            const cartao = document.createElement('div');
            cartao.className = 'cartao-aluno'; 
            
            cartao.innerHTML = `
                <div>
                    <span class="nome-aluno nome-aluno-destaque">${aluno.nome}</span>
                    <span class="neuro-destaque">${aluno.neurodivergencia}</span>
                </div>
                <div class="bolinha-status status-bom"></div>
            `;
            
            cartao.addEventListener('click', () => {
                localStorage.setItem('aluno_selecionado', JSON.stringify(aluno));
                window.location.href = 'perfil-aluno.html';
            });
            
            gridEstudantes.appendChild(cartao);
        });

    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        gridEstudantes.innerHTML = '<p class="texto-erro">Erro ao carregar estudantes.</p>';
    }
}

const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault(); 
        await signOut(auth);
        window.location.href = 'index.html'; 
    });
}