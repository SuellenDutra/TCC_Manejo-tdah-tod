// 1. Imports SEMPRE na primeira linha do arquivo
import { auth, db } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const gridAlunos = document.querySelector('.grid-alunos');

async function carregarAlunos() {
    gridAlunos.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #666;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando turma...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "alunos"));
        gridAlunos.innerHTML = ''; // Limpa a mensagem de carregamento

        if (querySnapshot.empty) {
             gridAlunos.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Nenhum aluno cadastrado ainda. Clique em "Novo Aluno" para começar.</p>';
             return;
        }

        querySnapshot.forEach((doc) => {
            const aluno = doc.data(); // Pega os dados do aluno
            const novoCartao = document.createElement('div');
            novoCartao.className = 'cartao-aluno';
            
            const corBolinha = (aluno.neurodivergencia === 'TOD' || aluno.neurodivergencia === 'TDAH e TOD') ? 'status-atencao' : 'status-bom';

            novoCartao.innerHTML = `
                <div>
                    <span class="nome-aluno" style="display:block;">${aluno.nome}</span>
                    <span style="font-size: 12px; color: #a4b3c1;">${aluno.neurodivergencia || 'Não informado'}</span>
                </div>
                <div class="bolinha-status ${corBolinha}"></div>
            `;
            
            novoCartao.addEventListener('click', () => {
                localStorage.setItem('aluno_selecionado', JSON.stringify(aluno));
                window.location.href = 'perfil-aluno.html';
            });
            
            gridAlunos.appendChild(novoCartao);
        });

    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        gridAlunos.innerHTML = '<p style="text-align:center; color:#e74c3c; grid-column: 1/-1;">Erro de conexão. Não foi possível carregar a lista.</p>';
    }
}

carregarAlunos();


const btnSair = document.getElementById('btn-sair');

if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault(); 
        
        try {
            await signOut(auth);
            window.location.href = 'index.html'; 
        } catch (error) {
            console.error("Erro ao deslogar:", error);
            alert("Não foi possível sair da conta. Tente novamente.");
        }
    });
}