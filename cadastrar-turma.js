import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

const formTurma = document.getElementById('form-turma');
const inputTurma = document.getElementById('nome-turma');
const btnSalvar = document.getElementById('btn-salvar-turma');
const listaTurmas = document.getElementById('lista-turmas');

// 1. Função para BUSCAR as turmas lá no Firestore e mostrar na tela
async function carregarTurmas() {
    try {
        const turmasQuery = query(collection(db, "turmas"), orderBy("nome"));
        const snapshot = await getDocs(turmasQuery);
        
        listaTurmas.innerHTML = ''; 

        if (snapshot.empty) {
            listaTurmas.innerHTML = '<li class="item-turma-vazio">Nenhuma turma cadastrada ainda.</li>';
            return;
        }

        snapshot.forEach(documento => {
            const turma = documento.data();
            const li = document.createElement('li');
            li.className = 'item-turma';
            li.innerHTML = `<i class="fa-solid fa-folder icone-pasta-turma"></i> ${turma.nome}`;
            listaTurmas.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao carregar:", error);
        listaTurmas.innerHTML = '<li class="texto-erro">Erro ao carregar turmas.</li>';
    }
}

// 2. Ação de SALVAR a turma nova quando clica no botão
formTurma.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando na nuvem...';
    btnSalvar.disabled = true;

    try {
        await addDoc(collection(db, "turmas"), {
            nome: inputTurma.value.trim()
        });
        
        inputTurma.value = ''; 
        await carregarTurmas(); 

    } catch (error) {
        console.error("Erro ao salvar turma:", error);
        alert("Erro de conexão ao salvar a turma.");
    } finally {
        btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Turma';
        btnSalvar.disabled = false;
    }
});

carregarTurmas();

// 3. Lógica do botão de Sair (Logout) no menu
const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault();
        localStorage.removeItem('perfilLogado');
        await signOut(auth);
        window.location.href = 'index.html';
    });
}