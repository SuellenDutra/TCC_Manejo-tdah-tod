let perfilSelecionado = 'Educador'; // Padrão
const cartoes = document.querySelectorAll('.cartao-perfil');

cartoes.forEach(cartao => {
    cartao.addEventListener('click', () => {
        cartoes.forEach(c => c.classList.remove('ativo'));
        cartao.classList.add('ativo');
        
        const nomePerfil = cartao.textContent;
        perfilSelecionado = nomePerfil.includes('Educador') ? 'Educador' : 'Familiar';
    });
});

const inputEmail = document.querySelector('input[type="email"]');
const inputSenha = document.querySelector('input[type="password"]');
const btnEntrar = document.querySelector('.btn-entrar');

function verificarCampos() {
    if (inputEmail.value !== '' && inputSenha.value !== '') {
        btnEntrar.disabled = false;
    } else {
        btnEntrar.disabled = true;
    }
}

inputEmail.addEventListener('input', verificarCampos);
inputSenha.addEventListener('input', verificarCampos);

btnEntrar.addEventListener('click', (evento) => {
    evento.preventDefault(); 
    
    const email = inputEmail.value;
    const senha = inputSenha.value;

    if (perfilSelecionado === 'Educador' && email === 'professor@teste.com' && senha === '1234') {
        window.location.href = 'turma.html';
    } 
    else if (perfilSelecionado === 'Familiar' && email === 'familia@teste.com' && senha === '1234') {
        const matriculaDigitada = prompt("Para segurança (LGPD), confirme a matrícula do seu filho (Ex: 2026001):");
        
        if (matriculaDigitada) {
            localStorage.setItem('matricula_familia', matriculaDigitada);
            window.location.href = 'painel-familia.html';
        }
    } 
    else {
        alert(`Acesso negado! Credenciais incorretas para o perfil de ${perfilSelecionado}.`);
        inputSenha.value = '';
        verificarCampos();
    }
});