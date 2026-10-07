let clients = [];
let selectedClient = null;

const list = document.getElementById("clientList");
const details = document.getElementById("clientDetails");
const question = document.getElementById("question");
const answer = document.getElementById("answer");
const askButton = document.getElementById("askButton");

async function loadClients() {
  const response = await fetch("/api/clients");
  clients = await response.json();

  list.innerHTML = clients.map((client) => `
    <button class="client" data-id="${client.id}">
      <strong>${client.name}</strong>
      <span>${client.id} · ${client.connectionType}</span>
    </button>
  `).join("");

  list.querySelectorAll(".client").forEach((button) => {
    button.addEventListener("click", () => selectClient(button.dataset.id));
  });

  if (clients.length) selectClient(clients[0].id);
}

function selectClient(id) {
  selectedClient = clients.find((client) => client.id === id);
  list.querySelectorAll(".client").forEach((button) => {
    button.classList.toggle("selected", button.dataset.id === id);
  });

  const delta = selectedClient.monthlyKwh - selectedClient.previousMonthlyKwh;
  const deltaText = `${delta >= 0 ? "+" : ""}${delta} kWh`;

  details.innerHTML = `
    <p class="eyebrow">CLIENT PROFILE</p>
    <h2>${selectedClient.name}</h2>
    <p>${selectedClient.id} · ${selectedClient.connectionType} · ${selectedClient.serviceStatus}</p>

    <div class="summary-grid">
      <div class="metric"><small>Monthly usage</small><strong>${selectedClient.monthlyKwh} kWh</strong></div>
      <div class="metric"><small>Previous month</small><strong>${selectedClient.previousMonthlyKwh} kWh</strong></div>
      <div class="metric"><small>Change</small><strong>${deltaText}</strong></div>
      <div class="metric"><small>Outstanding</small><strong>₹${selectedClient.outstandingAmount}</strong></div>
    </div>

    <p><strong>Last payment:</strong> ${selectedClient.lastPayment}</p>
    <p><strong>Access scope:</strong> Prototype exposes only the selected client's limited support context.</p>
  `;

  answer.textContent = "Claude's response will appear here.";
}

askButton.addEventListener("click", async () => {
  if (!selectedClient) {
    answer.textContent = "Select a client first.";
    return;
  }

  if (!question.value.trim()) {
    answer.textContent = "Enter a question first.";
    return;
  }

  askButton.disabled = true;
  answer.textContent = "Asking Claude...";

  try {
    const response = await fetch("/api/claude/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClient.id,
        question: question.value
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    answer.textContent = data.answer;
  } catch (error) {
    answer.textContent = error.message;
  } finally {
    askButton.disabled = false;
  }
});

loadClients().catch(() => {
  list.innerHTML = "<p>Could not load clients.</p>";
});
