import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const container = document.getElementById('container-timeline-familia');
const nomeFilho = document.getElementById('nome-filho');
const infoFilho = document.getElementById('info-filho');
const cabecalhoPainel = document.querySelector('.cabecalho-painel');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const emailLogado = user.email; 

        try {
            // 1. Busca os estudantes vinculados ao email do responsável
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

            const filhos = [];
            alunoSnapshot.forEach(doc => { filhos.push(doc.data()); });

            // 2. Se tiver mais de um filho, cria um Menu de Seleção (Dropdown)
            if (filhos.length > 1) {
                let seletorHtml = document.getElementById('seletor-filhos');
                if (!seletorHtml) {
                    const divSeletor = document.createElement('div');
                    
                    const label = document.createElement('label');
                    label.textContent = "Selecione o estudante:";
                    label.style.display = "block";
                    label.style.marginBottom = "8px";
                    label.style.fontWeight = "bold";
                    label.style.color = "#2E8B57";

                    const select = document.createElement('select');
                    select.id = 'seletor-filhos';
                    select.className = 'seletor-estudante';

                    // Preenche o menu com o nome de cada filho
                    filhos.forEach(filho => {
                        const option = document.createElement('option');
                        option.value = filho.nome;
                        option.textContent = filho.nome;
                        select.appendChild(option);
                    });

                    // Evento: Quando o pai trocar de filho no menu, recarrega a tela
                    select.addEventListener('change', (e) => {
                        const alunoSelecionado = filhos.find(f => f.nome === e.target.value);
                        carregarHistoricoAluno(alunoSelecionado);
                    });

                    divSeletor.appendChild(label);
                    divSeletor.appendChild(select);
                    
                    // Insere o seletor bem acima do cabeçalho com a foto
                    cabecalhoPainel.parentNode.insertBefore(divSeletor, cabecalhoPainel);
                }
            }

            // 3. Carrega por padrão o primeiro filho da lista ao entrar
            carregarHistoricoAluno(filhos[0]);

        } catch (error) {
            console.error("Erro ao buscar dados na nuvem:", error);
            container.innerHTML = '<p style="text-align:center; color:#e74c3c;">Erro de conexão. Não foi possível carregar o histórico.</p>';
        }

    } else {
        window.location.href = 'index.html'; 
    }
});

// FUNÇÃO ISOLADA: Carrega e pinta apenas os dados do aluno escolhido
async function carregarHistoricoAluno(aluno) {
    nomeFilho.textContent = aluno.nome;
    infoFilho.textContent = `Matrícula: ${aluno.matricula || '-'} | Turma: ${aluno.turma}`;
    container.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Buscando ocorrências...</p>';

    try {
        const ocorrenciasQuery = query(collection(db, "ocorrencias"), where("alunoNome", "==", aluno.nome));
        const ocorrenciasSnapshot = await getDocs(ocorrenciasQuery);

        if (ocorrenciasSnapshot.empty) {
            container.innerHTML = `
                <div class="caixa-formulario area-historico-vazia">
                    <i class="fa-regular fa-face-smile icone-sucesso-vazio"></i>
                    <p>Nenhuma ocorrência registrada para ${aluno.nome}. Tudo tranquilo!</p>
                </div>
            `;
        } else {
            container.innerHTML = ''; 
            
            const listaOcorrencias = [];
            ocorrenciasSnapshot.forEach(doc => listaOcorrencias.push(doc.data()));
            
            listaOcorrencias.sort((a, b) => {
                const tempoA = a.dataRegistroNuvem ? a.dataRegistroNuvem.toMillis() : 0;
                const tempoB = b.dataRegistroNuvem ? b.dataRegistroNuvem.toMillis() : 0;
                return tempoB - tempoA; 
            });

            listaOcorrencias.forEach(evento => {
                let classeBorda = 'timeline-positivo'; 
                let classeIcone = 'icone-positivo'; 
                let iconeFa = 'fa-star'; 

                if (evento.intensidade === 'Leve' || evento.intensidade === 'leve') {
                    classeBorda = 'timeline-leve'; classeIcone = 'icone-leve'; iconeFa = 'fa-circle-exclamation';
                } else if (evento.intensidade === 'Moderada' || evento.intensidade === 'moderada') {
                    classeBorda = 'timeline-moderada'; classeIcone = 'icone-moderada'; iconeFa = 'fa-circle-exclamation';
                } else if (evento.intensidade === 'Alta' || evento.intensidade === 'alta') {
                    classeBorda = 'timeline-alta'; classeIcone = 'icone-alta'; iconeFa = 'fa-circle-exclamation';
                }

                let horaFormatada = "--:--"; let dataFormatada = "--/--/----";
                if (evento.dataRegistroNuvem) {
                    const dataReal = evento.dataRegistroNuvem.toDate();
                    horaFormatada = dataReal.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    dataFormatada = dataReal.toLocaleDateString();
                }

                const cartao = document.createElement('div');
                cartao.className = `cartao-timeline ${classeBorda}`;
                
                cartao.innerHTML = `
                    <div class="timeline-icone ${classeIcone}">
                        <i class="fa-solid ${iconeFa}"></i>
                    </div>
                    <div class="timeline-conteudo">
                        <div class="timeline-titulo">Comportamento: ${evento.comportamentos ? evento.comportamentos.join(', ') : 'Não informado'}</div>
                        <div class="timeline-desc">Intensidade: ${evento.intensidade || '-'}</div>
                        ${evento.observacoes ? `<div class="timeline-obs">" ${evento.observacoes} "</div>` : ''}
                        <div style="font-size: 11px; color: #888; margin-top: 5px;">
                            <i class="fa-regular fa-calendar"></i> ${dataFormatada}
                        </div>
                    </div>
                    <div class="timeline-hora">${horaFormatada}</div>
                `;
                container.appendChild(cartao);
            });
        }
    } catch(error) {
        console.error(error);
        container.innerHTML = '<p style="text-align:center; color:#e74c3c;">Erro ao buscar ocorrências.</p>';
    }
}

// Desloga por qualquer botão de saída ativo na tela
const botoesSair = document.querySelectorAll('.btn-deslogar, .link-sair');
botoesSair.forEach(botao => {
    botao.addEventListener('click', async (e) => {
        e.preventDefault(); 
        localStorage.removeItem('perfilLogado');
        try {
            await signOut(auth);
            window.location.href = 'index.html'; 
        } catch (error) {
            console.error("Erro ao deslogar:", error);
            alert("Não foi possível sair. Tente novamente.");
        }
    });
});