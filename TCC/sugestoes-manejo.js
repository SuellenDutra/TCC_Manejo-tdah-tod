const btnEntendi = document.getElementById('btn-entendi');

btnEntendi.addEventListener('click', () => {
    const alunoString = localStorage.getItem('aluno_selecionado');
    const aluno = alunoString ? JSON.parse(alunoString) : null;
    
    const ocorrenciaAtualString = localStorage.getItem('ocorrencia_atual');
    const ocorrenciaAtual = ocorrenciaAtualString ? JSON.parse(ocorrenciaAtualString) : null;

    if (aluno && ocorrenciaAtual) {
        const chaveHistorico = `historico_${aluno.matricula}`;
        
        let historicoAluno = JSON.parse(localStorage.getItem(chaveHistorico)) || [];
        
        historicoAluno.unshift(ocorrenciaAtual);
        
        localStorage.setItem(chaveHistorico, JSON.stringify(historicoAluno));
        
        localStorage.removeItem('ocorrencia_atual');
    }

    window.location.href = 'perfil-aluno.html';
});