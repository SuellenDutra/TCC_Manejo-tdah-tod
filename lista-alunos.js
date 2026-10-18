import { db, auth } from './firebase-config.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ==========================================
// TRAVA DE SEGURANÇA E ADAPTAÇÃO VISUAL (GESTÃO)
// ==========================================
onAuthStateChanged(auth, (user) => {
    const perfil = localStorage.getItem('perfilLogado');
    
    // 1. Permite acesso para Educador OU Administrador
    if (!user || (perfil !== 'Educador' && perfil !== 'Administrador')) {
        window.location.href = 'index.html';
        return;
    }

    // 2. MODO LEITURA E TEMA ESCURO: Se for Gestão, adapta a tela
    if (perfil === 'Administrador') {
        // Aplica o tema corporativo escuro
        document.body.classList.add('tema-gestao'); 
        
        // Altera o título no menu lateral
        const subtituloMenu = document.querySelector('.menu-cabecalho p');
        if (subtituloMenu) subtituloMenu.textContent = 'Gestão Escolar';

        // Esconde o menu de professor e cria o atalho da gestão
        const menuLateral = document.querySelector('.menu-links');
        if (menuLateral) {
            menuLateral.innerHTML = `
                <li><a href="painel-admin.html" class="ativo"><i class="fa-solid fa-chart-line"></i> Visão Global da Gestão</a></li>
            `;
        }

        // Esconde os botões de edição
        const btnExcluirTurma = document.getElementById('btn-excluir-turma');
        const btnAdicionarAluno = document.querySelector('a[href="cadastro-aluno.html"]'); 
        
        if (btnExcluirTurma) btnExcluirTurma.style.display = 'none';
        if (btnAdicionarAluno) btnAdicionarAluno.style.display = 'none';
    }
});

const gridEstudantes = document.getElementById('grid-estudantes');
const tituloTurma = document.getElementById('titulo-turma');

const turmaSelecionada = localStorage.getItem('turma_selecionada');
const perfilAtual = localStorage.getItem('perfilLogado');

// Redirecionamento inteligente caso a página seja acessada sem turma selecionada
if (!turmaSelecionada) {
    window.location.href = perfilAtual === 'Administrador' ? 'painel-admin.html' : 'turma.html'; 
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

        querySnapshot.forEach((documento) => {
            const aluno = documento.data();
            aluno.id = documento.id; 

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

// ==========================================
// LÓGICA DE EXCLUIR A TURMA
// ==========================================
const btnExcluirTurma = document.getElementById('btn-excluir-turma');
if (btnExcluirTurma) {
    btnExcluirTurma.addEventListener('click', async () => {
        const confirmacao = confirm(`ATENÇÃO: Tem certeza que deseja excluir a turma "${turmaSelecionada}"?\n\nIsso apagará a pasta desta turma do seu painel.`);
        
        if (confirmacao) {
            btnExcluirTurma.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo...';
            btnExcluirTurma.disabled = true;

            try {
                const q = query(collection(db, "turmas"), where("nome", "==", turmaSelecionada));
                const snapshot = await getDocs(q);

                for (const documento of snapshot.docs) {
                    await deleteDoc(doc(db, "turmas", documento.id));
                }

                alert("Turma excluída com sucesso!");
                
                localStorage.removeItem('turma_selecionada');
                window.location.href = 'turma.html';

            } catch (error) {
                console.error("Erro ao excluir turma:", error);
                alert("Erro ao tentar excluir a turma.");
                btnExcluirTurma.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir Turma';
                btnExcluirTurma.disabled = false;
            }
        }
    });
}

// ==========================================
// LÓGICA DE SAIR DO SISTEMA
// ==========================================
const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault(); 
        localStorage.removeItem('perfilLogado');
        await signOut(auth);
        window.location.href = 'index.html'; 
    });
}

// ==========================================
// ROTEAMENTO INTELIGENTE DO BOTÃO VOLTAR
// ==========================================
const linksVoltar = document.querySelectorAll('a[href="turma.html"]');

linksVoltar.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Impede o HTML de te mandar para a tela errada
        const perfil = localStorage.getItem('perfilLogado');
        
        if (perfil === 'Administrador') {
            window.location.href = 'painel-admin.html'; // Devolve a gestão para o painel global
        } else {
            window.location.href = 'turma.html'; // Devolve o professor para as pastas dele
        }
    });
});