import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ==========================================
// TRAVA DE SEGURANÇA E CARREGAMENTO
// ==========================================
onAuthStateChanged(auth, (user) => {
    const perfil = localStorage.getItem('perfilLogado');
    
    if (!user || perfil !== 'Educador') {
        window.location.href = 'index.html';
    } else {
        // Só carrega as turmas DEPOIS que o Firebase confirmar quem é o professor logado!
        carregarTurmas(user.uid);
    }
});

const formTurma = document.getElementById('form-turma');
const inputTurma = document.getElementById('nome-turma');
const btnSalvar = document.getElementById('btn-salvar-turma');
const listaTurmas = document.getElementById('lista-turmas');

// 1. Função para BUSCAR apenas as turmas DESTE professor na listagem lateral
async function carregarTurmas(professorUid) {
    try {
        // A MÁGICA DO ISOLAMENTO: Pede ao banco apenas as turmas com o UID do professor
        const turmasQuery = query(collection(db, "turmas"), where("professorUid", "==", professorUid));
        const snapshot = await getDocs(turmasQuery);
        
        listaTurmas.innerHTML = ''; 

        if (snapshot.empty) {
            listaTurmas.innerHTML = '<li class="item-turma-vazio">Nenhuma turma cadastrada no seu perfil.</li>';
            return;
        }

        // Pega as turmas e organiza em ordem alfabética no JavaScript
        let lista = [];
        snapshot.forEach(documento => {
            lista.push({ id: documento.id, ...documento.data() });
        });
        lista.sort((a, b) => a.nome.localeCompare(b.nome));

        lista.forEach(turma => {
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

// 2. Ação de SALVAR a turma nova com o carimbo do professor
formTurma.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) return;

    btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando na nuvem...';
    btnSalvar.disabled = true;

    try {
        await addDoc(collection(db, "turmas"), {
            nome: inputTurma.value.trim(),
            professorUid: usuarioLogado.uid // <-- VÍNCULO DE PROPRIEDADE SALVO AQUI
        });
        
        inputTurma.value = ''; 
        await carregarTurmas(usuarioLogado.uid); 

    } catch (error) {
        console.error("Erro ao salvar turma:", error);
        alert("Erro de conexão ao salvar a turma.");
    } finally {
        btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Turma';
        btnSalvar.disabled = false;
    }
});

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