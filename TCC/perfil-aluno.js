const alunoSelecionado = localStorage.getItem('aluno_selecionado') || 'Aluno Não Encontrado';

document.getElementById('nome-aluno-titulo').textContent = alunoSelecionado;

const alunoString = localStorage.getItem('aluno_selecionado');
const aluno = alunoString ? JSON.parse(alunoString) : { nome: 'Erro', matricula: '-', neurodivergencia: '-' };

document.getElementById('nome-aluno-titulo').textContent = aluno.nome;
document.getElementById('matricula-aluno-texto').textContent = `Matrícula: ${aluno.matricula}`;
document.getElementById('neuro-aluno-texto').textContent = `Diagnóstico: ${aluno.neurodivergencia}`;


const containerTimeline = document.getElementById('container-timeline');

const chaveHistorico = `historico_${aluno.matricula}`;
const historicoAluno = JSON.parse(localStorage.getItem(chaveHistorico)) || [];

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
        const cartao = document.createElement('div');
        
        cartao.className = 'cartao-timeline timeline-alerta';
        
        const comportamentosTexto = evento.comportamentos.join(', ');

        cartao.innerHTML = `
            <div class="timeline-icone icone-alerta">
                <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <div class="timeline-conteudo">
                <div class="timeline-titulo">Comportamento: ${comportamentosTexto}</div>
                <div class="timeline-desc">Intensidade: ${evento.intensidade}</div>
                ${evento.observacoes ? `<div class="timeline-obs">" ${evento.observacoes} "</div>` : ''}
            </div>
            <div class="timeline-hora">
                ${evento.hora}
            </div>
        `;
        
        containerTimeline.appendChild(cartao);
    });
}

const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');

if (btnGerarRelatorio) {
    btnGerarRelatorio.addEventListener('click', () => {
        window.print();
    });
}