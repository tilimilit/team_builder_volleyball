document.addEventListener('DOMContentLoaded', () => {

    const playersData = [
      { "id": 1, "nome": "Dudu", "classificacao": 4, "sexo": "M" }, { "id": 2, "nome": "Neto", "classificacao": 4, "sexo": "M" },
      { "id": 3, "nome": "Luisa", "classificacao": 3, "sexo": "F" }, { "id": 4, "nome": "Cesar", "classificacao": 4, "sexo": "M" },
      { "id": 5, "nome": "Fred", "classificacao": 3, "sexo": "M" }, { "id": 6, "nome": "Igor", "classificacao": 4, "sexo": "M" },
      { "id": 7, "nome": "Cassim", "classificacao": 3, "sexo": "M" }, { "id": 8, "nome": "Gabriela", "classificacao": 3, "sexo": "F" },
      { "id": 9, "nome": "Wenya", "classificacao": 3, "sexo": "F" }, { "id": 10, "nome": "Raylon", "classificacao": 4, "sexo": "M" },
      { "id": 11, "nome": "Bruno", "classificacao": 2, "sexo": "M" }, { "id": 12, "nome": "Tata", "classificacao": 2, "sexo": "M" },
      { "id": 13, "nome": "Biancca", "classificacao": 3, "sexo": "F" }, { "id": 14, "nome": "Mateus", "classificacao": 3, "sexo": "M" },
      { "id": 15, "nome": "Luan", "classificacao": 3, "sexo": "M" }, { "id": 16, "nome": "Mariana", "classificacao": 2, "sexo": "F" },
      { "id": 17, "nome": "Lubia", "classificacao": 2, "sexo": "F" }, { "id": 18, "nome": "Vania", "classificacao": 3, "sexo": "F" },
      { "id": 19, "nome": "Lukas", "classificacao": 2, "sexo": "M" }, { "id": 20, "nome": "Kennedy", "classificacao": 3, "sexo": "M" },
      { "id": 21, "nome": "Wheliton", "classificacao": 2, "sexo": "M" }, { "id": 22, "nome": "William", "classificacao": 2, "sexo": "M" }
    ];

    const playerListContainer = document.getElementById('player-list-container');
    const selectionCounter = document.getElementById('selection-counter');
    const distributeButton = document.getElementById('distribute-button');
    const resultsContainer = document.getElementById('results-container');
    const teamsOutput = document.getElementById('teams-output');
    const instructionText = document.getElementById('instruction-text');

    const twoTeamsToggle = document.getElementById('two-teams-toggle');
    const coupleModeToggle = document.getElementById('couple-mode-toggle');
    const showStarsToggle = document.getElementById('show-stars-toggle');

    let selectedPlayerIds = new Set();
    let requiredPlayers = 12;

    function resetSelection() {
        selectedPlayerIds.clear();
        document.querySelectorAll('.player-card.selected').forEach(card => card.classList.remove('selected'));
        updateSelectionState();
    }

    function updateGameMode() {
        requiredPlayers = twoTeamsToggle.checked ? 8 : 12;
        instructionText.innerHTML = `Escolha <strong>${requiredPlayers} jogadores</strong> para a partida de hoje.`;
        if (selectedPlayerIds.size > 0) resetSelection();
        else updateSelectionState();
    }

    function updateSelectionState() {
        const count = selectedPlayerIds.size;
        selectionCounter.innerHTML = `Selecionados: <strong>${count}</strong> de ${requiredPlayers}`;
        distributeButton.disabled = count !== requiredPlayers;
    }

    function handlePlayerClick(event) {
        const card = event.target.closest('.player-card');
        if (!card) return;
        const playerId = parseInt(card.dataset.playerId);
        if (selectedPlayerIds.has(playerId)) {
            selectedPlayerIds.delete(playerId);
            card.classList.remove('selected');
        } else if (selectedPlayerIds.size < requiredPlayers) {
            selectedPlayerIds.add(playerId);
            card.classList.add('selected');
        } else {
            alert(`Você já selecionou ${requiredPlayers} jogadores!`);
        }
        updateSelectionState();
    }

    function renderPlayers() {
        const sortedPlayers = [...playersData].sort((a, b) => b.classificacao - a.classificacao);
        sortedPlayers.forEach(player => {
            const card = document.createElement('div');
            card.classList.add('player-card');
            card.dataset.playerId = player.id;
            card.innerHTML = `<div class="player-name">${player.nome}</div><div class="player-rating">${'★'.repeat(player.classificacao)}${'☆'.repeat(5 - player.classificacao)}</div>`;
            playerListContainer.appendChild(card);
        });
    }

     function distributeTeams() {
        const isCoupleModeActive = coupleModeToggle.checked;
        const numberOfTeams = twoTeamsToggle.checked ? 2 : 3;
        
        let selectedPlayers = playersData.filter(p => selectedPlayerIds.has(p.id));

        // Cria a quantidade correta de times
        let teams = Array.from({ length: numberOfTeams }, (_, i) => ({
            name: `Time ${String.fromCharCode(65 + i)}`,
            players: [],
            totalScore: 0,
            womenCount: 0
        }));

        const neto = selectedPlayers.find(p => p.nome === 'Neto');
        const luisa = selectedPlayers.find(p => p.nome === 'Luisa');

        let playersToDistribute = [...selectedPlayers];

        // Regra do Casal
        if (isCoupleModeActive && neto && luisa) {
            const coupleTeam = teams[0];
            coupleTeam.players.push(neto, luisa);
            coupleTeam.totalScore += neto.classificacao + luisa.classificacao;
            if(luisa.sexo === 'F') coupleTeam.womenCount++;
            
            playersToDistribute = playersToDistribute.filter(p => p.nome !== 'Neto' && p.nome !== 'Luisa');
        }

        // --- NOVO NÚCLEO DA LÓGICA DE BALANCEAMENTO ---
        
        // 1. Aplica a pontuação ajustada para balanceamento (homem +1)
        const playersWithAdjustedScore = playersToDistribute.map(p => ({
            ...p,
            adjustedScore: p.sexo === 'M' ? p.classificacao + 1 : p.classificacao
        }));

        // 2. Ordena pela pontuação ajustada (do maior para o menor)
        playersWithAdjustedScore.sort((a, b) => b.adjustedScore - a.adjustedScore);

        // 3. Distribui os jogadores um a um
        playersWithAdjustedScore.forEach(player => {
            // Critério de desempate: prioriza times com menos mulheres se o jogador for mulher
            // Em seguida, prioriza times com menor pontuação total
            teams.sort((a, b) => {
                if (player.sexo === 'F') {
                    if (a.womenCount !== b.womenCount) {
                        return a.womenCount - b.womenCount;
                    }
                }
                return a.totalScore - b.totalScore;
            });
            
            // Adiciona o jogador ao time de menor prioridade (o primeiro da lista ordenada)
            const targetTeam = teams[0];
            targetTeam.players.push(player);
            targetTeam.totalScore += player.classificacao;
            if (player.sexo === 'F') {
                targetTeam.womenCount++;
            }
        });

        renderResults(teams);
    }
    
    function renderResults(teams) {
        teamsOutput.innerHTML = '';
        teams.sort((a, b) => a.name.localeCompare(b.name));

        teams.forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.classList.add('team-card');
            let playersHtml = '<ul>';
            team.players.sort((a, b) => b.classificacao - a.classificacao);
            team.players.forEach(player => {
                playersHtml += `<li><span>${player.nome} ${player.sexo === 'F' ? '(F)' : ''}</span> <span class="player-result-rating">${'★'.repeat(player.classificacao)}</span></li>`;
            });
            playersHtml += '</ul>';

            teamCard.innerHTML = `<h3>${team.name}</h3>${playersHtml}`;
            teamsOutput.appendChild(teamCard);
        });
        resultsContainer.classList.remove('hidden');
    }

    // --- STARTUP & EVENT LISTENERS ---
    twoTeamsToggle.addEventListener('change', updateGameMode);
    showStarsToggle.addEventListener('change', () => document.body.classList.toggle('show-ratings', showStarsToggle.checked));
    
    renderPlayers();
    playerListContainer.addEventListener('click', handlePlayerClick);
    distributeButton.addEventListener('click', distributeTeams);
    
    // Inicializa o modo de jogo no carregamento da página
    updateGameMode();
});