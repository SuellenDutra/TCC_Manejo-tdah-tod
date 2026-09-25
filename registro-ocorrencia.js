import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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
const aluno = alunoString ? JSON.parse(alunoString) : { nome: 'Aluno Desconhecido', matricula: 'sem_matricula', emailFamiliar: '' };
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
        // 1. Remove a seleção e todas as classes de cores de TODOS os chips
        chipsIntensidade.forEach(c => {
            c.classList.remove('selecionado', 'chip-leve', 'chip-moderada', 'chip-alta');
        });
        
        // 2. Adiciona a seleção ao chip clicado
        chip.classList.add('selecionado');
        
        // 3. Aplica a classe de cor específica baseada no atributo 'data-valor'
        const valor = chip.getAttribute('data-valor');
        
        if (valor === 'Leve' || valor === 'leve') {
            chip.classList.add('chip-leve');
        } else if (valor === 'Moderada' || valor === 'moderada') {
            chip.classList.add('chip-moderada');
        } else if (valor === 'Alta' || valor === 'alta') {
            chip.classList.add('chip-alta');
        }
    });
});

const form = document.getElementById('form-ocorrencia');

form.addEventListener('submit', async (evento) => {
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

    try {
        const btnSalvar = document.querySelector('.btn-nova-ocorrencia');
        btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando na Nuvem...'; 
        btnSalvar.disabled = true; 

        await addDoc(collection(db, "ocorrencias"), {
            alunoNome: aluno.nome,
            matricula: aluno.matricula, // PONTE PARA O ALUNO
            emailFamiliar: aluno.emailFamiliar, // PONTE PARA A FAMÍLIA
            comportamentos: comportamentosSelecionados,
            intensidade: intensidade,
            observacoes: observacoes,
            dataVisual: new Date().toLocaleDateString('pt-BR'), // Facilita a exibição
            horaVisual: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
            dataRegistroNuvem: serverTimestamp() // Carimbo oficial do Google
        });

        const ocorrenciaAtual = { comportamentos: comportamentosSelecionados };
        localStorage.setItem('ocorrencia_atual', JSON.stringify(ocorrenciaAtual));

        window.location.href = 'sugestoes-manejo.html';

    } catch (erro) {
        console.error("Erro ao salvar no Firebase:", erro);
        alert('Ocorreu um erro de conexão. Tente novamente.');
        
        const btnSalvar = document.querySelector('.btn-nova-ocorrencia');
        btnSalvar.innerHTML = 'Salvar e Ver Sugestões <i class="fa-solid fa-arrow-right"></i>';
        btnSalvar.disabled = false;
    }
});