const alunoString = localStorage.getItem('aluno_selecionado');
const aluno = alunoString ? JSON.parse(alunoString) : { nome: 'Aluno Desconhecido' };
document.getElementById('nome-aluno-registro').textContent = aluno.nome;

const chipsComportamento = document.querySelectorAll('#chips-comportamento .chip');
chipsComportamento.forEach(chip => {
    chip.addEventListener('click', () => {
        chip.classList.toggle('selecionado');
    });
});

const chipsIntensidade = document.querySelectorAll('#chips-intensidade .chip');
chipsIntensidade.forEach(chip => {
    chip.addEventListener('click', () => {
        chipsIntensidade.forEach(c => c.classList.remove('selecionado'));
        chip.classList.add('selecionado');
    });
});

const form = document.getElementById('form-ocorrencia');
form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const comportamentosSelecionados = Array.from(document.querySelectorAll('#chips-comportamento .chip.selecionado'))
                                            .map(chip => chip.getAttribute('data-valor'));
    
    const chipIntensidadeSelecionado = document.querySelector('#chips-intensidade .chip.selecionado');
    const intensidade = chipIntensidadeSelecionado ? chipIntensidadeSelecionado.getAttribute('data-valor') : 'Não informada';
    
    const observacoes = document.getElementById('obs-ocorrencia').value;

    if (comportamentosSelecionados.length === 0) {
        alert('Por favor, selecione pelo menos um comportamento antes de salvar.');
        return;
    }

    const ocorrenciaAtual = {
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        comportamentos: comportamentosSelecionados,
        intensidade: intensidade,
        observacoes: observacoes
    };

    localStorage.setItem('ocorrencia_atual', JSON.stringify(ocorrenciaAtual));

    window.location.href = 'sugestoes-manejo.html';
});