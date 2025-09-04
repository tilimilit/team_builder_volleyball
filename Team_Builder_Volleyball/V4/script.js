document.addEventListener("DOMContentLoaded", () => {
  const playersData = [
    { id: 1, nome: "Dudu", classificacao: 4 },
    { id: 2, nome: "Neto", classificacao: 4 },
    { id: 3, nome: "Luisa", classificacao: 3 },
    { id: 4, nome: "Cesar", classificacao: 4 },
    { id: 5, nome: "Fred", classificacao: 2 },
    { id: 6, nome: "Igor", classificacao: 4 },
    { id: 7, nome: "Cassim", classificacao: 3 },
    { id: 8, nome: "Gabriela", classificacao: 3 },
    { id: 9, nome: "Wenya", classificacao: 3 },
    { id: 10, nome: "Raylon", classificacao: 4 },
    { id: 11, nome: "Bruno", classificacao: 2 },
    { id: 12, nome: "Tata", classificacao: 2 },
    { id: 13, nome: "Biancca", classificacao: 3 },
    { id: 14, nome: "Mateus", classificacao: 3 },
    { id: 15, nome: "Luan", classificacao: 3 },
    { id: 16, nome: "Mariana", classificacao: 2 },
    { id: 17, nome: "Lubia", classificacao: 2 },
    { id: 18, nome: "Vania", classificacao: 3 },
    { id: 19, nome: "Luccas", classificacao: 2 },
    { id: 20, nome: "Kennedy", classificacao: 3 },
    { id: 21, nome: "Antony", classificacao: 2 },
    { id: 22, nome: "Wheliton", classificacao: 2 },
  ];

  const playerListContainer = document.getElementById("player-list-container");
  const selectionCounter = document.getElementById("selection-counter");
  const distributeButton = document.getElementById("distribute-button");
  const resultsContainer = document.getElementById("results-container");
  const teamsOutput = document.getElementById("teams-output");
  const coupleModeToggle = document.getElementById("couple-mode-toggle");
  const showStarsToggle = document.getElementById("show-stars-toggle");

  let selectedPlayerIds = new Set();

  function updateSelectionState() {
    const count = selectedPlayerIds.size;
    selectionCounter.innerHTML = `Selecionados: <strong>${count}</strong> de 12`;
    distributeButton.disabled = count !== 12;
  }

  function handlePlayerClick(event) {
    const card = event.target.closest(".player-card");
    if (!card) return;
    const playerId = parseInt(card.dataset.playerId);
    if (selectedPlayerIds.has(playerId)) {
      selectedPlayerIds.delete(playerId);
      card.classList.remove("selected");
    } else {
      if (selectedPlayerIds.size < 12) {
        selectedPlayerIds.add(playerId);
        card.classList.add("selected");
      } else {
        alert("Você já selecionou 12 jogadores!");
      }
    }
    updateSelectionState();
  }

  function renderPlayers() {
    const sortedPlayers = [...playersData].sort(
      (a, b) => b.classificacao - a.classificacao
    );
    sortedPlayers.forEach((player) => {
      const card = document.createElement("div");
      card.classList.add("player-card");
      card.dataset.playerId = player.id;
      card.innerHTML = `<div class="player-name">${
        player.nome
      }</div><div class="player-rating">${"★".repeat(
        player.classificacao
      )}${"☆".repeat(5 - player.classificacao)}</div>`;
      playerListContainer.appendChild(card);
    });
  }

  function distributeTeams() {
    const isCoupleModeActive = coupleModeToggle.checked;
    let selectedPlayers = playersData.filter((p) =>
      selectedPlayerIds.has(p.id)
    );
    selectedPlayers.sort((a, b) => b.classificacao - a.classificacao);

    let teams = [
      { name: "Time A", players: [], totalScore: 0 },
      { name: "Time B", players: [], totalScore: 0 },
      { name: "Time C", players: [], totalScore: 0 },
    ];

    const neto = selectedPlayers.find((p) => p.nome === "Neto");
    const luisa = selectedPlayers.find((p) => p.nome === "Luisa");

    if (isCoupleModeActive && neto && luisa) {
      let remainingPlayers = selectedPlayers.filter(
        (p) => p.nome !== "Neto" && p.nome !== "Luisa"
      );
      const coupleTeam = teams[0];
      coupleTeam.players.push(neto, luisa);
      coupleTeam.totalScore += neto.classificacao + luisa.classificacao;

      remainingPlayers.forEach((player) => {
        teams.sort((a, b) => a.totalScore - b.totalScore);
        teams[0].players.push(player);
        teams[0].totalScore += player.classificacao;
      });
    } else {
      selectedPlayers.forEach((player) => {
        teams.sort((a, b) => a.totalScore - b.totalScore);
        teams[0].players.push(player);
        teams[0].totalScore += player.classificacao;
      });
    }
    renderResults(teams);
  }

  function renderResults(teams) {
    teamsOutput.innerHTML = "";
    teams.sort((a, b) => a.name.localeCompare(b.name));

    teams.forEach((team) => {
      const teamCard = document.createElement("div");
      teamCard.classList.add("team-card");
      let playersHtml = "<ul>";
      team.players.sort((a, b) => b.classificacao - a.classificacao);
      team.players.forEach((player) => {
        // MUDANÇA SUTIL: Adicionado um <span> com classe nas estrelas do resultado
        playersHtml += `<li><span>${
          player.nome
        }</span> <span class="player-result-rating">${"★".repeat(
          player.classificacao
        )}</span></li>`;
      });
      playersHtml += "</ul>";

      teamCard.innerHTML = `
                <h3>${team.name}</h3>
                ${playersHtml}
            `;
      teamsOutput.appendChild(teamCard);
    });
    resultsContainer.classList.remove("hidden");
  }

  // NOVO: Event Listener para o interruptor de ocultar estrelas
  showStarsToggle.addEventListener("change", () => {
    // Adiciona ou remove a classe 'show-ratings' do body
    document.body.classList.toggle("show-ratings", showStarsToggle.checked);
  });

  renderPlayers();
  playerListContainer.addEventListener("click", handlePlayerClick);
  distributeButton.addEventListener("click", distributeTeams);
});
