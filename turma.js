import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ==========================================
// TRAVA DE SEGURANÇA E INICIALIZAÇÃO
// ==========================================
onAuthStateChanged(auth, (user) => {
    const perfil = localStorage.getItem('perfilLogado');
    // Se não houver usuário logado no Firebase OU se o perfil não for de Educador, bloqueia!
    if (!user || perfil !== 'Educador') {
        window.location.href = 'index.html';
    } else {
        // Só carrega o painel APÓS o Firebase confirmar quem é o professor logado
        inicializarPainel(user.uid);
    }
});

const gridTurmas = document.getElementById('grid-turmas');
const gridResultados = document.getElementById('grid-resultados-alunos');
const secaoResultados = document.getElementById('secao-resultados');

const inputNome = document.getElementById('filtro-nome');
const selectTurma = document.getElementById('filtro-turma');
const inputNeuro = document.getElementById('filtro-neuro');
const inputDataInicio = document.getElementById('filtro-data-inicio');
const inputDataFim = document.getElementById('filtro-data-fim');
const btnLimpar = document.getElementById('btn-limpar-filtros');

let listaTodosAlunos = [];
let listaTodasOcorrencias = [];

// 1. Carrega APENAS Turmas, Alunos e Ocorrências DESTE professor logado
async function inicializarPainel(professorUid) {
    try {
        // --- BUSCA AS TURMAS ISOLADAS ---
        const turmasQuery = query(collection(db, "turmas"), where("professorUid", "==", professorUid));
        const snapshotTurmas = await getDocs(turmasQuery);
        
        let turmasDoProfessor = [];
        snapshotTurmas.forEach(doc => turmasDoProfessor.push(doc.data()));
        
        // Ordena em ordem alfabética no JavaScript (evita exigência de índices extras no Firebase)
        turmasDoProfessor.sort((a, b) => a.nome.localeCompare(b.nome));

        gridTurmas.innerHTML = '';
        selectTurma.innerHTML = '<option value="">Todas as turmas</option>';

        if (turmasDoProfessor.length === 0) {
            gridTurmas.innerHTML = `
                <div class="area-vazia">
                    <p>Você ainda não tem turmas cadastradas no seu perfil.</p>
                </div>
            `;
        } else {
            turmasDoProfessor.forEach(turma => {
                // Preenche o filtro de turmas no topo
                const option = document.createElement('option');
                option.value = turma.nome;
                option.textContent = turma.nome;
                selectTurma.appendChild(option);

                // Cria o cartão da pasta da turma
                const cartao = document.createElement('div');
                cartao.className = 'cartao-aluno';
                cartao.innerHTML = `
                    <div class="cartao-turma-item">
                        <i class="fa-solid fa-folder-open icone-pasta-turma"></i>
                        <span class="nome-aluno">${turma.nome}</span>
                    </div>
                    <i class="fa-solid fa-chevron-right icone-seta-direita"></i>
                `;
                
                cartao.addEventListener('click', () => {
                    localStorage.setItem('turma_selecionada', turma.nome);
                    window.location.href = 'lista-alunos.html'; 
                });
                
                gridTurmas.appendChild(cartao);
            });
        }

        // --- BUSCA OS ALUNOS E FILTRA PELAS TURMAS DESTE PROFESSOR ---
        const nomesDasTurmas = turmasDoProfessor.map(t => t.nome);
        const snapshotAlunos = await getDocs(collection(db, "alunos"));
        listaTodosAlunos = [];
        
        snapshotAlunos.forEach(doc => {
            const dados = doc.data();
            // Só guarda na lista se a turma do aluno for uma das turmas do professor logado
            if (nomesDasTurmas.includes(dados.turma)) {
                dados.id = doc.id;
                listaTodosAlunos.push(dados);
            }
        });

        // --- BUSCA AS OCORRÊNCIAS E FILTRA PELOS ALUNOS DESTE PROFESSOR ---
        const nomesDosAlunos = listaTodosAlunos.map(a => a.nome);
        const snapshotOcorrencias = await getDocs(collection(db, "ocorrencias"));
        listaTodasOcorrencias = [];
        
        snapshotOcorrencias.forEach(doc => {
            const oc = doc.data();
            // Só guarda a ocorrência se o nome do aluno estiver na lista dos alunos deste professor
            if (nomesDosAlunos.includes(oc.alunoNome)) {
                listaTodasOcorrencias.push(oc);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar painel:", error);
        gridTurmas.innerHTML = '<p class="texto-erro">Erro ao carregar os dados do painel.</p>';
    }
}

// 2. Função que aplica os filtros em tempo real
function aplicarFiltros() {
    const termoNome = inputNome.value.trim().toLowerCase();
    const turmaEscolhida = selectTurma.value;
    const termoNeuro = inputNeuro.value.trim().toLowerCase();
    const dataInicio = inputDataInicio.value ? new Date(inputDataInicio.value + "T00:00:00") : null;
    const dataFim = inputDataFim.value ? new Date(inputDataFim.value + "T23:59:59") : null;

    // Verifica se algum filtro foi preenchido pelo professor
    const temFiltroAtivo = termoNome || turmaEscolhida || termoNeuro || dataInicio || dataFim;

    if (!temFiltroAtivo) {
        secaoResultados.classList.add('oculto');
        return;
    }

    secaoResultados.classList.remove('oculto');

    const alunosFiltrados = listaTodosAlunos.filter(aluno => {
        const bateNome = !termoNome || (aluno.nome && aluno.nome.toLowerCase().includes(termoNome));
        const bateTurma = !turmaEscolhida || aluno.turma === turmaEscolhida;
        const bateNeuro = !termoNeuro || (aluno.neurodivergencia && aluno.neurodivergencia.toLowerCase().includes(termoNeuro));

        // Se o professor filtrou por período, verifica se o aluno tem ocorrência naquela data
        let batePeriodo = true;
        if (dataInicio || dataFim) {
            batePeriodo = listaTodasOcorrencias.some(oc => {
                if (oc.alunoNome !== aluno.nome || !oc.dataRegistroNuvem) return false;
                const dataOc = oc.dataRegistroNuvem.toDate();
                if (dataInicio && dataOc < dataInicio) return false;
                if (dataFim && dataOc > dataFim) return false;
                return true;
            });
        }

        return bateNome && bateTurma && bateNeuro && batePeriodo;
    });

    renderizarResultados(alunosFiltrados);
}

// 3. Desenha os alunos encontrados na tela inicial
function renderizarResultados(alunos) {
    gridResultados.innerHTML = '';

    if (alunos.length === 0) {
        gridResultados.innerHTML = `
            <div class="area-vazia">
                <p>Nenhum estudante encontrado com os filtros selecionados.</p>
            </div>
        `;
        return;
    }

    alunos.forEach(aluno => {
        const cartao = document.createElement('div');
        cartao.className = 'cartao-aluno';
        cartao.innerHTML = `
            <div>
                <span class="nome-aluno nome-aluno-destaque">${aluno.nome}</span>
                <span class="neuro-destaque">${aluno.neurodivergencia}</span>
                <span class="etiqueta-turma-card"><i class="fa-solid fa-folder"></i> ${aluno.turma}</span>
            </div>
            <div class="bolinha-status status-bom"></div>
        `;

        // Clicar no aluno leva direto para o histórico dele, independente da turma!
        cartao.addEventListener('click', () => {
            localStorage.setItem('turma_selecionada', aluno.turma);
            localStorage.setItem('aluno_selecionado', JSON.stringify(aluno));
            window.location.href = 'perfil-aluno.html';
        });

        gridResultados.appendChild(cartao);
    });
}

// Eventos de digitação e seleção para filtrar instantaneamente
inputNome.addEventListener('input', aplicarFiltros);
selectTurma.addEventListener('change', aplicarFiltros);
inputNeuro.addEventListener('input', aplicarFiltros);
inputDataInicio.addEventListener('change', aplicarFiltros);
inputDataFim.addEventListener('change', aplicarFiltros);

btnLimpar.addEventListener('click', () => {
    inputNome.value = '';
    selectTurma.value = '';
    inputNeuro.value = '';
    inputDataInicio.value = '';
    inputDataFim.value = '';
    secaoResultados.classList.add('oculto');
});

// Lógica de Sair do Sistema
const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault(); 
        localStorage.removeItem('perfilLogado');
        await signOut(auth);
        window.location.href = 'index.html'; 
    });
}