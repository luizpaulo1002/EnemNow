// Banco de Dados (em memória)
const db = {
    "Matemática": {
        color: "var(--color-math)",
        topics: [
            "Conjuntos e Operações Básicas",
            "Razão, Proporção e Porcentagem",
            "Matemática Financeira",
            "Progressões (PA/PG)",
            "Funções (Afim, Quadrática, Exponencial e Logarítmica)",
            "Trigonometria",
            "Geometria Plana",
            "Geometria Espacial",
            "Geometria Analítica",
            "Estatística",
            "Probabilidade"
        ]
    },
    "Física": {
        color: "var(--color-phys)",
        topics: [
            "Cinemática",
            "Dinâmica",
            "Energia, Trabalho e Potência",
            "Gravitação Universal",
            "Hidrostática",
            "Termologia e Termodinâmica",
            "Ondulatória",
            "Óptica",
            "Eletromagnetismo"
        ]
    },
    "Química": {
        color: "var(--color-chem)",
        topics: [
            "Propriedades da Matéria",
            "Atomística",
            "Ligações Químicas",
            "Estequiometria",
            "Termoquímica",
            "Cinética e Equilíbrio Químico",
            "Eletroquímica",
            "Radioatividade",
            "Química Orgânica",
            "Química Ambiental"
        ]
    },
    "Biologia": {
        color: "var(--color-bio)",
        topics: [
            "Origem da Vida e Evolução",
            "Bioquímica e Citologia",
            "Virologia e Bacteriologia",
            "Doenças e Saúde Pública",
            "Genética",
            "Botânica",
            "Zoologia",
            "Ecologia"
        ]
    },
    "Humanas": {
        color: "var(--color-hum)",
        topics: [
            "História Antiga e Medieval",
            "História Moderna e Contemporânea",
            "Guerras Mundiais e Guerra Fria",
            "História do Brasil (Colônia, Império e República)",
            "Geografia Física (Clima, Biomas e Cartografia)",
            "Geopolítica e Globalização",
            "Filosofia",
            "Sociologia"
        ]
    },
    "Linguagens": {
        color: "var(--color-lang)",
        topics: [
            "Gramática",
            "Gêneros Textuais e Interpretação",
            "Escolas Literárias",
            "Artes",
            "Língua Estrangeira (Inglês/Espanhol)",
            "Redação"
        ]
    }
};

const ENEM_DATE = new Date('2026-11-01');

// Estado Inicial
let state = {
    startDate: new Date().toISOString().split('T')[0],
    careerFocus: 'geral',
    progress: {}
};

const taskTypes = ['A/L', 'R', 'E', 'R1', 'R2'];

// Carregar ou Inicializar Estado
function loadState() {
    const saved = localStorage.getItem('enem2026_planner');
    if (saved) {
        state = JSON.parse(saved);

        // Garante que o estado seja atualizado com possíveis novas mudanças estruturais do banco de dados
        for (const subj in db) {
            if (!state.progress[subj]) state.progress[subj] = {};

            // Adiciona tópicos ausentes
            db[subj].topics.forEach(topic => {
                if (!state.progress[subj][topic]) {
                    state.progress[subj][topic] = { 'A/L': false, 'R': false, 'E': false, 'R1': false, 'R2': false };
                }
            });

            // Remove tópicos antigos que não estão mais no banco de dados
            for (const topic in state.progress[subj]) {
                if (!db[subj].topics.includes(topic)) {
                    delete state.progress[subj][topic];
                }
            }
        }

        // Remove matérias que não estão mais no banco de dados
        for (const subj in state.progress) {
            if (!db[subj]) {
                delete state.progress[subj];
            }
        }
        saveState();
    } else {
        // Inicializa a estrutura de progresso
        for (const subj in db) {
            state.progress[subj] = {};
            db[subj].topics.forEach(topic => {
                state.progress[subj][topic] = { 'A/L': false, 'R': false, 'E': false, 'R1': false, 'R2': false };
            });
        }
        saveState();
    }
}

function saveState() {
    localStorage.setItem('enem2026_planner', JSON.stringify(state));
}

// Renderizar a Interface
function renderSubjects() {
    const container = document.getElementById('subjectsContainer');

    // Preservar o estado de quais cards estão abertos antes de re-renderizar
    const openSubjects = [];
    container.querySelectorAll('.subject-card').forEach(card => {
        const header = card.querySelector('.subject-header');
        const list = card.querySelector('.topic-list');
        if (list && list.classList.contains('active')) {
            const subjName = header.querySelector('h2').innerText;
            openSubjects.push(subjName);
        }
    });

    container.innerHTML = '';

    const highlights = getHighlights(state.careerFocus);

    for (const [subj, data] of Object.entries(db)) {
        const subjProgress = calculateSubjectProgress(subj);
        const isHighlight = highlights.includes(subj);

        const card = document.createElement('div');
        card.className = `subject-card ${isHighlight ? 'highlight' : ''}`;

        let topicsHTML = '';
        data.topics.forEach(topic => {
            let checkboxes = '';
            taskTypes.forEach(task => {
                const checked = state.progress[subj][topic][task] ? 'checked' : '';
                checkboxes += `
                    <label class="custom-cb">
                        <span>${task}</span>
                        <input type="checkbox" onchange="toggleTask('${subj}', '${topic}', '${task}')" ${checked}>
                        <div class="cb-box"></div>
                    </label>
                `;
            });

            topicsHTML += `
                <div class="topic-item">
                    <div class="topic-name">${topic}</div>
                    <div class="checkbox-group">${checkboxes}</div>
                </div>
            `;
        });

        const isOpen = openSubjects.includes(subj);

        card.innerHTML = `
            <div class="subject-header" onclick="toggleAccordion(this)">
                <div class="subject-title">
                    <div class="subject-dot" style="background: ${data.color}; box-shadow: 0 0 10px ${data.color}"></div>
                    <h2 style="font-size: 1.2rem;">${subj}</h2>
                    ${isHighlight ? '<span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px;">Prioridade Alta</span>' : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 0.9rem; color: var(--text-secondary);">${subjProgress}% concluído</span>
                    <span style="font-size: 1.2rem; transition: transform 0.3s; transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};" class="chevron">▼</span>
                </div>
            </div>
            <div class="topic-list ${isOpen ? 'active' : ''}">
                ${topicsHTML}
            </div>
        `;
        container.appendChild(card);
    }
}

// Funções Lógicas
function getHighlights(focus) {
    if (focus === 'exatas') return ['Matemática', 'Física'];
    if (focus === 'humanas') return ['Humanas', 'Linguagens'];
    if (focus === 'saude') return ['Biologia', 'Química'];
    return [];
}

window.toggleAccordion = function (header) {
    const list = header.nextElementSibling;
    const chevron = header.querySelector('.chevron');
    if (list.classList.contains('active')) {
        list.classList.remove('active');
        chevron.style.transform = 'rotate(0deg)';
    } else {
        list.classList.add('active');
        chevron.style.transform = 'rotate(180deg)';
    }
}

window.toggleTask = function (subj, topic, task) {
    state.progress[subj][topic][task] = !state.progress[subj][topic][task];
    saveState();
    updateDashboard();
}

function calculateSubjectProgress(subj) {
    let totalTasks = 0;
    let completed = 0;
    const topics = state.progress[subj];
    for (const topic in topics) {
        for (const task in topics[topic]) {
            totalTasks++;
            if (topics[topic][task]) completed++;
        }
    }
    return totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);
}

function updateDashboard() {
    // Atualiza os Inputs
    document.getElementById('startDate').value = state.startDate;
    document.getElementById('careerFocus').value = state.careerFocus;

    // Calcula Datas e Ritmo
    const start = new Date(state.startDate);
    const today = new Date();
    const calcDate = start > today ? start : today;

    const msDiff = ENEM_DATE - calcDate;
    const daysLeft = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));

    document.getElementById('daysLeft').textContent = daysLeft;

    const warningParams = document.getElementById('paceWarning');
    warningParams.style.display = (daysLeft > 0 && daysLeft < 180) ? 'block' : 'none';

    // Progresso Global
    let total = 0, comp = 0;
    let topicsTotal = 0, topicsComp = 0;

    for (const subj in state.progress) {
        for (const topic in state.progress[subj]) {
            topicsTotal++;
            let isTopicFinished = true;
            for (const task in state.progress[subj][topic]) {
                total++;
                if (state.progress[subj][topic][task]) {
                    comp++;
                } else {
                    isTopicFinished = false;
                }
            }
            if (isTopicFinished) topicsComp++;
        }
    }

    const pbVal = total === 0 ? 0 : Math.round((comp / total) * 100);
    document.getElementById('globalProgressBar').style.width = pbVal + '%';
    document.getElementById('globalProgressText').textContent = pbVal + '%';

    // Cálculo de Ritmo
    const topicsLeft = topicsTotal - topicsComp;
    const weeksLeft = daysLeft / 7;

    if (daysLeft === 0) {
        document.getElementById('paceDisplay').textContent = "O dia chegou!";
    } else {
        const pacePerWeek = Math.ceil(topicsLeft / weeksLeft);
        document.getElementById('paceDisplay').textContent = `${pacePerWeek} tópicos / semana`;
    }

    // Renderiza as Matérias
    renderSubjects();
}

// Lógica de Exportação / Importação
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "enem2026_save.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState && importedState.progress) {
                state = importedState;
                saveState();
                updateDashboard();
                alert("Progresso importado com sucesso!");
            } else {
                alert("Arquivo inválido. Certifique-se de ser o arquivo de backup correto.");
            }
        } catch (error) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reseta o input
}

// Monitores de Eventos
document.getElementById('startDate').addEventListener('change', (e) => {
    state.startDate = e.target.value;
    saveState();
    updateDashboard();
});

document.getElementById('careerFocus').addEventListener('change', (e) => {
    state.careerFocus = e.target.value;
    saveState();
    updateDashboard();
});

document.getElementById('btnExport').addEventListener('click', exportData);
document.getElementById('btnImport').addEventListener('click', () => {
    document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', importData);

// Inicialização
loadState();
updateDashboard();
