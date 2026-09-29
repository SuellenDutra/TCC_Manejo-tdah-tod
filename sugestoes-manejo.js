import { auth } from './firebase-config.js';
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

const ocorrenciaString = localStorage.getItem('ocorrencia_atual');
const ocorrenciaAtual = ocorrenciaString ? JSON.parse(ocorrenciaString) : null;

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
    gridSugestoes.innerHTML = '<p class="area-vazia">Nenhuma estratégia específica encontrada. Continue com o manejo padrão da turma.</p>';
}

const btnEntendi = document.getElementById('btn-entendi');
if (btnEntendi) {
    btnEntendi.addEventListener('click', () => {
        localStorage.removeItem('ocorrencia_atual');
        window.location.href = 'perfil-aluno.html';
    });
}