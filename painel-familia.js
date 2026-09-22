// 1. IMPORTAÇÕES DO FIREBASE
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const container = document.getElementById('container-timeline-familia');
const nomeFilho = document.getElementById('nome-filho');
const infoFilho = document.getElementById('info-filho');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const emailLogado = user.email; 

        try {
            const alunoQuery = query(collection(db, "alunos"), where("emailFamiliar", "==", emailLogado));
            const alunoSnapshot = await getDocs(alunoQuery);

            if (alunoSnapshot.empty) {
                nomeFilho.textContent = 'Nenhum aluno encontrado';
                infoFilho.textContent = `Seu e-mail (${emailLogado}) não está vinculado a nenhum estudante.`;
                container.innerHTML = `
                    <div class="caixa-formulario area-historico-vazia mensagem-erro">
                        <i class="fa-solid fa-circle-xmark icone-erro"></i>
                        <p>Procure a secretaria da escola para vincular seu e-mail à matrícula do seu filho.</p>
                    </div>
                `;
                return;
            }

            let dadosAluno = null;
            alunoSnapshot.forEach(doc => { dadosAluno = doc.data(); });

            nomeFilho.textContent = dadosAluno.nome;
            infoFilho.textContent = `Matrícula: ${dadosAluno.matricula} | Turma: ${dadosAluno.turma}`;

            const ocorrenciasQuery = query(collection(db, "ocorrencias"), where("emailFamiliar", "==", emailLogado));
            const ocorrenciasSnapshot = await getDocs(ocorrenciasQuery);

            if (ocorrenciasSnapshot.empty) {
                container.innerHTML = `
                    <div class="caixa-formulario area-historico-vazia">
                        <i class="fa-regular fa-face-smile icone-sucesso-vazio"></i>
                        <p>Nenhuma ocorrência registrada para ${dadosAluno.nome}. Tudo tranquilo!</p>
                    </div>
                `;
            } else {
                container.innerHTML = ''; // Limpa a tela
                
                const listaOcorrencias = [];
                ocorrenciasSnapshot.forEach(doc => listaOcorrencias.push(doc.data()));
                
                listaOcorrencias.sort((a, b) => {
                    return b.dataRegistroNuvem?.toMillis() - a.dataRegistroNuvem?.toMillis();
                });

                listaOcorrencias.forEach(evento => {
                    const cartao = document.createElement('div');
                    cartao.className = 'cartao-timeline timeline-alerta';
                    
                    const comportamentosTexto = evento.comportamentos.join(', ');

                    cartao.innerHTML = `
                        <div class="timeline-icone icone-alerta">
                            <i class="fa-solid fa-circle-exclamation"></i>
                        </div>
                        <div class="timeline-conteudo">
                            <div class="timeline-titulo">Comportamento: ${comportamentosTexto}</div>
                            <div class="timeline-desc">Intensidade: ${evento.intensidade}</div>
                            ${evento.observacoes ? `<div class="timeline-obs">" ${evento.observacoes} "</div>` : ''}
                            <div style="font-size: 11px; color: #888; margin-top: 5px;"><i class="fa-regular fa-calendar"></i> ${evento.dataVisual || ''}</div>
                        </div>
                        <div class="timeline-hora">${evento.horaVisual || ''}</div>
                    `;
                    container.appendChild(cartao);
                });
            }

        } catch (error) {
            console.error("Erro ao buscar dados na nuvem:", error);
            container.innerHTML = '<p style="text-align:center; color:#e74c3c;">Erro de conexão. Não foi possível carregar o histórico.</p>';
        }

    } else {
        window.location.href = 'index.html';
    }
});


const botoesSair = document.querySelectorAll('.btn-deslogar, .link-sair');

botoesSair.forEach(botao => {
    botao.addEventListener('click', async (e) => {
        e.preventDefault(); 
        try {
            await signOut(auth);
            window.location.href = 'index.html'; 
        } catch (error) {
            console.error("Erro ao deslogar:", error);
            alert("Não foi possível sair. Tente novamente.");
        }
    });
});