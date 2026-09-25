import { db } from './firebase-config.js';
// Importação completa corrigida: histórico + exclusão
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ==========================================
// TRAVA DE SEGURANÇA (ROTA DO EDUCADOR)
// ==========================================
onAuthStateChanged(auth, (user) => {
    const perfil = localStorage.getItem('perfilLogado');
    // Se não houver usuário logado no Firebase OU se o perfil não for de Educador, bloqueia!
    if (!user || perfil !== 'Educador') {
        window.location.href = 'index.html';
    }
});

const alunoString = localStorage.getItem('aluno_selecionado');
const aluno = alunoString ? JSON.parse(alunoString) : { nome: 'Erro', matricula: '-', neurodivergencia: '-' };

document.getElementById('nome-aluno-titulo').textContent = aluno.nome;
document.getElementById('matricula-aluno-texto').textContent = `Matrícula: ${aluno.matricula}`;
document.getElementById('neuro-aluno-texto').textContent = `Diagnóstico: ${aluno.neurodivergencia}`;

const containerTimeline = document.getElementById('container-timeline');

async function carregarHistoricoFirebase() {
    containerTimeline.innerHTML = '<p class="texto-carregando"><i class="fa-solid fa-spinner fa-spin"></i> Carregando histórico da nuvem...</p>';

    try {
        const q = query(collection(db, "ocorrencias"), where("alunoNome", "==", aluno.nome));
        const querySnapshot = await getDocs(q);
        
        let historicoAluno = [];
        
        querySnapshot.forEach((doc) => {
            historicoAluno.push(doc.data());
        });

        historicoAluno.sort((a, b) => {
            const tempoA = a.dataRegistroNuvem ? a.dataRegistroNuvem.toMillis() : 0;
            const tempoB = b.dataRegistroNuvem ? b.dataRegistroNuvem.toMillis() : 0;
            return tempoB - tempoA; 
        });

        if (historicoAluno.length === 0) {
            containerTimeline.innerHTML = `
                <div class="caixa-formulario area-historico-vazia">
                    <i class="fa-regular fa-clock icone-relogio"></i>
                    <p>Nenhuma ocorrência registrada para este aluno ainda.</p>
                </div>
            `;
        } else {
            containerTimeline.innerHTML = ''; 
            
            historicoAluno.forEach(evento => {
                let classeBorda = 'timeline-positivo'; 
                let classeIcone = 'icone-positivo'; 
                let iconeFa = 'fa-circle-exclamation'; 

                if (evento.intensidade === 'Leve' || evento.intensidade === 'leve') {
                    classeBorda = 'timeline-leve';
                    classeIcone = 'icone-leve';
                } else if (evento.intensidade === 'Moderada' || evento.intensidade === 'moderada') {
                    classeBorda = 'timeline-moderada';
                    classeIcone = 'icone-moderada';
                } else if (evento.intensidade === 'Alta' || evento.intensidade === 'alta') {
                    classeBorda = 'timeline-alta';
                    classeIcone = 'icone-alta';
                } else {
                    iconeFa = 'fa-star'; 
                }

                const cartao = document.createElement('div');
                cartao.className = `cartao-timeline ${classeBorda}`;
                
                const comportamentosTexto = evento.comportamentos ? evento.comportamentos.join(', ') : 'Não informado';
                
                let horaFormatada = "--:--";
                if (evento.dataRegistroNuvem) {
                    const dataReal = evento.dataRegistroNuvem.toDate();
                    horaFormatada = dataReal.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                cartao.innerHTML = `
                    <div class="timeline-icone ${classeIcone}">
                        <i class="fa-solid ${iconeFa}"></i>
                    </div>
                    <div class="timeline-conteudo">
                        <div class="timeline-titulo">Comportamento: ${comportamentosTexto}</div>
                        <div class="timeline-desc">Intensidade: ${evento.intensidade || '-'}</div>${evento.observacoes ? `<div class="timeline-obs">" ${evento.observacoes} "</div>` : ''}
                    </div>
                    <div class="timeline-hora">
                        ${horaFormatada}
                    </div>
                `;
                
                containerTimeline.appendChild(cartao);
            });
        }
    } catch (erro) {
        console.error("Erro ao buscar histórico:", erro);
        containerTimeline.innerHTML = '<p class="texto-erro">Erro de conexão. Não foi possível carregar o histórico.</p>';
    }
}

carregarHistoricoFirebase();

const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
if (btnGerarRelatorio) {
    btnGerarRelatorio.addEventListener('click', () => {
        window.print();
    });
}

// ==========================================
// LÓGICA DE EXCLUIR O ALUNO
// ==========================================
const btnExcluirAluno = document.getElementById('btn-excluir-aluno');

if (btnExcluirAluno) {
    btnExcluirAluno.addEventListener('click', async () => {
        const alunoAtual = JSON.parse(localStorage.getItem('aluno_selecionado'));
        
        if (!alunoAtual || !alunoAtual.id) {
            alert("Erro: ID do aluno não encontrado.");
            return;
        }

        const confirmacao = confirm(`ATENÇÃO: Tem certeza que deseja excluir o estudante "${alunoAtual.nome}" permanentemente?`);
        
        if (confirmacao) {
            btnExcluirAluno.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo...';
            btnExcluirAluno.disabled = true;

            try {
                await deleteDoc(doc(db, "alunos", alunoAtual.id));
                alert("Estudante excluído com sucesso!");
                window.location.href = 'lista-alunos.html';

            } catch (error) {
                console.error("Erro ao excluir aluno:", error);
                alert("Erro de conexão ao tentar excluir.");
                btnExcluirAluno.innerHTML = '<i class="fa-solid fa-user-xmark"></i> Excluir Aluno';
                btnExcluirAluno.disabled = false;
            }
        }
    });
}

// ==========================================
// LÓGICA DE SAIR DO SISTEMA
// ==========================================
btnSair.addEventListener('click', async (e) => {
        e.preventDefault(); 
        
        // NOVIDADE: Limpa a memória de segurança ao sair
        localStorage.removeItem('perfilLogado');
        
        await signOut(auth);
        window.location.href = 'index.html'; 
    });

// ==========================================
// LÓGICA DE REALOCAR ALUNO PARA OUTRA TURMA
// ==========================================
const btnAbrirRealocacao = document.getElementById('btn-abrir-realocacao');
const caixaRealocacao = document.getElementById('caixa-realocacao');
const selectNovaTurma = document.getElementById('select-nova-turma');
const btnConfirmarRealocacao = document.getElementById('btn-confirmar-realocacao');
const btnCancelarRealocacao = document.getElementById('btn-cancelar-realocacao');

if (btnAbrirRealocacao) {
    btnAbrirRealocacao.addEventListener('click', async () => {
        caixaRealocacao.classList.remove('oculto');
        selectNovaTurma.innerHTML = '<option value="">Buscando turmas...</option>';

        try {
            const snapshotTurmas = await getDocs(collection(db, "turmas"));
            selectNovaTurma.innerHTML = '';

            snapshotTurmas.forEach(documento => {
                const dadosTurma = documento.data();
                const option = document.createElement('option');
                option.value = dadosTurma.nome;
                option.textContent = dadosTurma.nome;

                if (dadosTurma.nome === aluno.turma) {
                    option.selected = true;
                }
                selectNovaTurma.appendChild(option);
            });
        } catch (erro) {
            console.error("Erro ao carregar turmas:", erro);
            selectNovaTurma.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    });
}

if (btnCancelarRealocacao) {
    btnCancelarRealocacao.addEventListener('click', () => {
        caixaRealocacao.classList.add('oculto');
    });
}

if (btnConfirmarRealocacao) {
    btnConfirmarRealocacao.addEventListener('click', async () => {
        const novaTurma = selectNovaTurma.value;
        if (!novaTurma) return;

        btnConfirmarRealocacao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        btnConfirmarRealocacao.disabled = true;

        try {
            await updateDoc(doc(db, "alunos", aluno.id), {
                turma: novaTurma
            });

            aluno.turma = novaTurma;
            localStorage.setItem('aluno_selecionado', JSON.stringify(aluno));
            localStorage.setItem('turma_selecionada', novaTurma);

            alert(`Estudante transferido para a turma "${novaTurma}" com sucesso!`);
            window.location.href = 'lista-alunos.html';

        } catch (erro) {
            console.error("Erro ao transferir aluno:", erro);
            alert("Erro ao tentar transferir o estudante.");
            btnConfirmarRealocacao.innerHTML = '<i class="fa-solid fa-check"></i> Confirmar';
            btnConfirmarRealocacao.disabled = false;
        }
    });
}