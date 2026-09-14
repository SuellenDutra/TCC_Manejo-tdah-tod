const form = document.getElementById('form-cadastro');
const inputNome = document.getElementById('nome-aluno');
const inputMatricula = document.getElementById('matricula-aluno');//matrícula
const inputNeuro = document.getElementById('neuro-aluno');//diagnóstico

form.addEventListener('submit', (evento) => {
    evento.preventDefault(); 
    
    const novoAluno = {
        nome: inputNome.value,
        matricula: inputMatricula.value,
        neurodivergencia: inputNeuro.value
    };
    
    let alunosSalvos = JSON.parse(localStorage.getItem('novos_alunos')) || [];
    
    alunosSalvos.push(novoAluno);
    localStorage.setItem('novos_alunos', JSON.stringify(alunosSalvos));
    
    window.location.href = 'turma.html';
});ocation.href = 'turma.html';