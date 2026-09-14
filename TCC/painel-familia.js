const matriculaFamilia = localStorage.getItem('matricula_familia');
const alunosSalvos = JSON.parse(localStorage.getItem('novos_alunos')) || [];
const alunosIniciais = [
    { nome: 'Ana Silva', matricula: '2026001', neurodivergencia: 'TDAH' },
    { nome: 'Bruno Costa', matricula: '2026002', neurodivergencia: 'TOD' },
    { nome: 'Carlos Mendes', matricula: '2026003', neurodivergencia: 'TDAH e TOD' },
    { nome: 'Diana Souza', matricula: '2026004', neurodivergencia: 'Nenhum' }
];
const todosOsAlunos = [...alunosIniciais, ...alunosSalvos];
const filho = todosOsAlunos.find(aluno => aluno.matricula === matriculaFamilia);

if (filho) {
    document.getElementById('nome-filho').textContent = filho.nome;
    document.getElementById('info-filho').textContent = `Matrícula: ${filho.matricula} | Diagnóstico: ${filho.neurodivergencia}`;

    const chaveHistorico = `historico_${filho.matricula}`;
    const historico = JSON.parse(localStorage.getItem(chaveHistorico)) || [];
    const container = document.getElementById('container-timeline-familia');

    if (historico.length === 0) {
        container.innerHTML = `
            <div class="caixa-formulario area-historico-vazia">
                <i class="fa-regular fa-face-smile icone-sucesso-vazio"></i>
                <p>Nenhuma ocorrência registrada hoje. O dia está tranquilo!</p>
            </div>
        `;
    } else {
        container.innerHTML = '';
        historico.forEach(evento => {
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
                <div class="timeline-hora">${evento.hora}</div>
            `;
            container.appendChild(cartao);
        });
    }
} else {
    document.getElementById('nome-filho').textContent = 'Aluno não encontrado';
    document.getElementById('info-filho').textContent = 'Verifique a matrícula digitada.';
    document.getElementById('container-timeline-familia').innerHTML = `
        <div class="caixa-formulario area-historico-vazia mensagem-erro">
            <i class="fa-solid fa-circle-xmark icone-erro"></i>
            <p>Não foi possível localizar os registros. Contate a secretaria da escola.</p>
        </div>
    `;
}