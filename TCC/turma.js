const gridAlunos = document.querySelector('.grid-alunos');
const alunosSalvos = JSON.parse(localStorage.getItem('novos_alunos')) || [];

const alunosIniciais = [
    { nome: 'Ana Silva', matricula: '2026001', neurodivergencia: 'TDAH' },
    { nome: 'Bruno Costa', matricula: '2026002', neurodivergencia: 'TOD' },
    { nome: 'Carlos Mendes', matricula: '2026003', neurodivergencia: 'TDAH e TOD' },
    { nome: 'Diana Souza', matricula: '2026004', neurodivergencia: 'Nenhum' }
];

const todosOsAlunos = [...alunosIniciais, ...alunosSalvos];

todosOsAlunos.forEach(aluno => {
    const novoCartao = document.createElement('div');
    novoCartao.className = 'cartao-aluno';
    
    const corBolinha = (aluno.neurodivergencia === 'TOD' || aluno.neurodivergencia === 'TDAH e TOD') ? 'status-atencao' : 'status-bom';

    novoCartao.innerHTML = `
        <div>
            <span class="nome-aluno" style="display:block;">${aluno.nome}</span>
            <span style="font-size: 12px; color: #a4b3c1;">${aluno.neurodivergencia}</span>
        </div>
        <div class="bolinha-status ${corBolinha}"></div>
    `;
    
    novoCartao.addEventListener('click', () => {
        localStorage.setItem('aluno_selecionado', JSON.stringify(aluno));
        window.location.href = 'perfil-aluno.html';
    });
    
    gridAlunos.appendChild(novoCartao);
});