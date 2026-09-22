const ocorrenciaString = localStorage.getItem('ocorrencia_atual');
const ocorrenciaAtual = ocorrenciaString ? JSON.parse(ocorrenciaString) : null;

const alunoString = localStorage.getItem('aluno_selecionado');
const aluno = alunoString ? JSON.parse(alunoString) : null;

const baseEstrategias = {
    'Agitação': `
        <div class="cartao-sugestao">
            <i class="fa-solid fa-shoe-prints icone-sugestao"></i>
            <div>
                <h3 class="titulo-sugestao">Pausa para Movimento</h3>
                <p class="texto-sugestao">Ofereça intervalos breves para atividade física que ajudam a regular a energia e melhorar o foco.</p>
            </div>
        </div>`,
    'Desatenção': `
        <div class="cartao-sugestao">
            <i class="fa-solid fa-list-check icone-sugestao"></i>
            <div>
                <h3 class="titulo-sugestao">Instruções Curtas</h3>
                <p class="texto-sugestao">Use frases claras e diretas com um objetivo por vez para facilitar a compreensão e execução.</p>
            </div>
        </div>`,
    'Impulsividade': `
        <div class="cartao-sugestao">
            <i class="fa-regular fa-star icone-sugestao"></i>
            <div>
                <h3 class="titulo-sugestao">Reforço Positivo</h3>
                <p class="texto-sugestao">Reconheça comportamentos desejados imediatamente com elogios específicos e autênticos.</p>
            </div>
        </div>`,
    'Conflito': `
        <div class="cartao-sugestao">
            <i class="fa-solid fa-cubes icone-sugestao"></i>
            <div>
                <h3 class="titulo-sugestao">Ambiente Estruturado</h3>
                <p class="texto-sugestao">Organize espaços e rotinas previsíveis que reduzem ansiedade e promovem segurança emocional.</p>
            </div>
        </div>`,
    'Frustração': `
        <div class="cartao-sugestao">
            <i class="fa-solid fa-cubes icone-sugestao"></i>
            <div>
                <h3 class="titulo-sugestao">Ambiente Estruturado</h3>
                <p class="texto-sugestao">Organize espaços e rotinas previsíveis que reduzem ansiedade e promovem segurança emocional.</p>
            </div>
        </div>`,
    'Desafio': `
        <div class="cartao-sugestao">
            <i class="fa-regular fa-star icone-sugestao"></i>
            <div>
                <h3 class="titulo-sugestao">Reforço Positivo</h3>
                <p class="texto-sugestao">Reconheça comportamentos desejados imediatamente com elogios específicos e autênticos.</p>
            </div>
        </div>`
};

const gridSugestoes = document.querySelector('.grid-sugestoes');

if (ocorrenciaAtual && ocorrenciaAtual.comportamentos && ocorrenciaAtual.comportamentos.length > 0) {
    gridSugestoes.innerHTML = ''; 
    const estrategiasExibidas = new Set();

    ocorrenciaAtual.comportamentos.forEach(comportamento => {
        const cardHTML = baseEstrategias[comportamento];
        
        if (cardHTML && !estrategiasExibidas.has(cardHTML)) {
            gridSugestoes.innerHTML += cardHTML;
            estrategiasExibidas.add(cardHTML);
        }
    });
} else {
    gridSugestoes.innerHTML = '<p style="text-align:center; width:100%;">Nenhuma estratégia específica encontrada. Continue com o manejo padrão da turma.</p>';
}

const btnEntendi = document.getElementById('btn-entendi');
btnEntendi.addEventListener('click', () => {
    if (aluno && ocorrenciaAtual) {
        const chaveHistorico = `historico_${aluno.matricula}`;
        
        let historicoAluno = JSON.parse(localStorage.getItem(chaveHistorico)) || [];
        
        historicoAluno.unshift(ocorrenciaAtual);
        
        localStorage.setItem(chaveHistorico, JSON.stringify(historicoAluno));
        
        localStorage.removeItem('ocorrencia_atual');
    }

    window.location.href = 'perfil-aluno.html';
});