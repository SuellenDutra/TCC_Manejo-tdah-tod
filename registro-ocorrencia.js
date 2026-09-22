import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
        chipsIntensidade.forEach(c => c.classList.remove('selecionado'));
        chip.classList.add('selecionado');
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