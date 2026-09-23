import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const alunoString = localStorage.getItem('aluno_selecionado');
const aluno = alunoString ? JSON.parse(alunoString) : { nome: 'Erro', matricula: '-', neurodivergencia: '-' };

document.getElementById('nome-aluno-titulo').textContent = aluno.nome;
document.getElementById('matricula-aluno-texto').textContent = `Matrícula: ${aluno.matricula}`;
document.getElementById('neuro-aluno-texto').textContent = `Diagnóstico: ${aluno.neurodivergencia}`;

const containerTimeline = document.getElementById('container-timeline');

async function carregarHistoricoFirebase() {
    containerTimeline.innerHTML = '<p style="text-align:center; margin-top:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando histórico da nuvem...</p>';

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
            return tempoB - tempoA; // Ordem decrescente
        });

        if (historicoAluno.length === 0) {
            containerTimeline.innerHTML = `
                <div class="caixa-formulario area-historico-vazia">
                    <i class="fa-regular fa-clock icone-relogio"></i>
                    <p>Nenhuma ocorrência registrada para este aluno ainda.</p>
                </div>
            `;
        } else {
            containerTimeline.innerHTML = ''; // Limpa o aviso de "Carregando"
            
            historicoAluno.forEach(evento => {
                
                // --- INÍCIO DA MUDANÇA (PASSO 4) ---
                // 1. Variáveis dinâmicas para as cores e ícones
                let classeBorda = 'timeline-positivo'; // Padrão
                let classeIcone = 'icone-positivo'; // Padrão
                let iconeFa = 'fa-circle-exclamation'; 

                // 2. Verifica a intensidade no banco de dados e aplica a cor correspondente
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
                    // Se não tiver intensidade ou for positivo
                    iconeFa = 'fa-star'; 
                }

                const cartao = document.createElement('div');
                // 3. Aplica a classe da borda dinamicamente no cartão
                cartao.className = `cartao-timeline ${classeBorda}`;
                // --- FIM DA MUDANÇA (PASSO 4) ---
                
                const comportamentosTexto = evento.comportamentos ? evento.comportamentos.join(', ') : 'Não informado';
                
                // Converte a hora oficial do Google (Timestamp) para hora normal (HH:MM)
                let horaFormatada = "--:--";
                if (evento.dataRegistroNuvem) {
                    const dataReal = evento.dataRegistroNuvem.toDate();
                    horaFormatada = dataReal.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                // 4. Aplica as classes do ícone dinamicamente no HTML interno
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
        containerTimeline.innerHTML = '<p style="text-align:center; color:#e74c3c;">Erro de conexão. Não foi possível carregar o histórico.</p>';
    }
}

carregarHistoricoFirebase();

const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
if (btnGerarRelatorio) {
    btnGerarRelatorio.addEventListener('click', () => {
        window.print();
    });
}