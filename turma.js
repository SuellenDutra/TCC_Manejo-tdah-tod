import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const gridTurmas = document.getElementById('grid-turmas');

// Função para buscar as turmas e criar os cartões na tela
async function carregarTurmas() {
    try {
        const turmasQuery = query(collection(db, "turmas"), orderBy("nome"));
        const snapshot = await getDocs(turmasQuery);
        
        gridTurmas.innerHTML = '';

        if (snapshot.empty) {
            gridTurmas.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #666; font-size: 16px;">Você ainda não tem turmas cadastradas.</p>
                </div>
            `;
            return;
        }

        // Para cada turma, cria um cartão clicável
        snapshot.forEach(doc => {
            const turma = doc.data();
            const cartao = document.createElement('div');
            cartao.className = 'cartao-aluno'; // Reutilizando a classe CSS que você já tem
            
            cartao.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fa-solid fa-folder-open" style="font-size: 32px; color: #6B9BD1;"></i>
                    <span class="nome-aluno" style="font-size: 18px;">${turma.nome}</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: #ccc;"></i>
            `;
            
            // Quando o professor clicar na pasta da turma:
            cartao.addEventListener('click', () => {
                // 1. Salva o nome da turma na memória do navegador
                localStorage.setItem('turma_selecionada', turma.nome);
                // 2. Redireciona para a tela que mostra os alunos DESTA turma (que nós já criamos!)
                window.location.href = 'lista-alunos.html'; 
            });
            
            gridTurmas.appendChild(cartao);
        });

    } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        gridTurmas.innerHTML = '<p style="color: red;">Erro ao carregar as turmas.</p>';
    }
}

// Inicia a função assim que a tela abre
carregarTurmas();

// Lógica de Sair do Sistema
const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = 'index.html';
    });
}