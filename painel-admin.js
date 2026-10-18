import { db, auth } from './firebase-config.js';
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ==========================================
// TRAVA DE SEGURANÇA (EXCLUSIVO GESTÃO)
// ==========================================
onAuthStateChanged(auth, (user) => {
    const perfil = localStorage.getItem('perfilLogado');
    if (!user || perfil !== 'Administrador') {
        window.location.replace('index.html');
    } else {
        inicializarPainelGestao();
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

async function inicializarPainelGestao() {
    try {
        const turmasQuery = query(collection(db, "turmas"));
        const snapshotTurmas = await getDocs(turmasQuery);

        // 1. Usar um Map para garantir que não teremos pastas repetidas no ecrã
        let mapaTurmasUnicas = new Map();

        snapshotTurmas.forEach(doc => {
            const dados = doc.data();
            // Se a turma tem nome e ainda não foi registada no nosso mapa, guardamos
            if (dados.nome && !mapaTurmasUnicas.has(dados.nome)) {
                mapaTurmasUnicas.set(dados.nome, dados);
            }
        });

        // 2. Transformar o Mapa de volta numa lista e ordenar alfabeticamente
        let todasTurmas = Array.from(mapaTurmasUnicas.values());
        todasTurmas.sort((a, b) => a.nome.localeCompare(b.nome));

        gridTurmas.innerHTML = '';
        selectTurma.innerHTML = '<option value="">Todas as turmas</option>';

        if (todasTurmas.length === 0) {
            gridTurmas.innerHTML = '<div class="area-vazia"><p>Nenhuma turma cadastrada na instituição.</p></div>';
        } else {
            todasTurmas.forEach(turma => {
                // Preenche a caixa de seleção para os filtros
                const option = document.createElement('option');
                option.value = turma.nome;
                option.textContent = turma.nome;
                selectTurma.appendChild(option);

                // Cria o Cartão (Pasta) único para cada turma
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

        // BUSCA TODOS OS ESTUDANTES DA ESCOLA (para a pesquisa rápida)
        const snapshotAlunos = await getDocs(collection(db, "alunos"));
        listaTodosAlunos = [];
        snapshotAlunos.forEach(doc => {
            const dados = doc.data();
            dados.id = doc.id;
            listaTodosAlunos.push(dados);
        });

        // BUSCA TODAS AS OCORRÊNCIAS GLOBAIS
        const snapshotOcorrencias = await getDocs(collection(db, "ocorrencias"));
        listaTodasOcorrencias = [];
        snapshotOcorrencias.forEach(doc => {
            listaTodasOcorrencias.push(doc.data());
        });

    } catch (error) {
        console.error("Erro ao carregar a gestão:", error);
        gridTurmas.innerHTML = '<p class="texto-erro">Erro ao carregar os dados institucionais.</p>';
    }
}

function aplicarFiltros() {
    const termoNome = inputNome.value.trim().toLowerCase();
    const turmaEscolhida = selectTurma.value;
    const termoNeuro = inputNeuro.value.trim().toLowerCase();
    const dataInicio = inputDataInicio.value ? new Date(inputDataInicio.value + "T00:00:00") : null;
    const dataFim = inputDataFim.value ? new Date(inputDataFim.value + "T23:59:59") : null;

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

function renderizarResultados(alunos) {
    gridResultados.innerHTML = '';

    if (alunos.length === 0) {
        gridResultados.innerHTML = '<div class="area-vazia"><p>Nenhum estudante encontrado na base.</p></div>';
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

        cartao.addEventListener('click', () => {
            localStorage.setItem('turma_selecionada', aluno.turma);
            localStorage.setItem('aluno_selecionado', JSON.stringify(aluno));
            window.location.href = 'perfil-aluno.html';
        });

        gridResultados.appendChild(cartao);
    });
}

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

const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault(); 
        localStorage.removeItem('perfilLogado');
        await signOut(auth);
        window.location.href = 'index.html'; 
    });
}