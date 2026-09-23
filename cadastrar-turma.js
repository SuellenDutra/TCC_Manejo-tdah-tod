import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const formTurma = document.getElementById('form-turma');
const inputTurma = document.getElementById('nome-turma');
const btnSalvar = document.getElementById('btn-salvar-turma');
const listaTurmas = document.getElementById('lista-turmas');

// 1. Função para BUSCAR as turmas lá no Firestore e mostrar na tela
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

        snapshot.forEach(doc => {
            const turma = doc.data();
            const li = document.createElement('li');
            li.className = 'item-turma'; // Aqui aplicamos o design do CSS!
            li.innerHTML = `<i class="fa-solid fa-folder" style="color: #6B9BD1;"></i> ${turma.nome}`;
            listaTurmas.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao carregar:", error);
        listaTurmas.innerHTML = '<li style="color: red;">Erro ao carregar turmas.</li>';
    }
}

// 2. Ação de SALVAR a turma nova quando clica no botão
formTurma.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Feedback visual pro professor
    btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando na nuvem...';
    btnSalvar.disabled = true;

    try {
        // Envia para a coleção "turmas"
        await addDoc(collection(db, "turmas"), {
            nome: inputTurma.value.trim()
        });
        
        inputTurma.value = ''; // Limpa o campo para digitar outra
        await carregarTurmas(); // Atualiza a lista na hora!

    } catch (error) {
        console.error("Erro ao salvar turma:", error);
        alert("Erro de conexão ao salvar a turma.");
    } finally {
        // Devolve o botão ao normal
        btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Turma';
        btnSalvar.disabled = false;
    }
});

// Assim que a tela abre, ele já puxa a lista
carregarTurmas();

// 3. Lógica do botão de Sair (Logout) no menu
const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = 'index.html';
    });
}