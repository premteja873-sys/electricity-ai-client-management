require("dotenv").config();

const path = require("path");
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "64kb" }));
app.use(express.static(path.join(__dirname, "public")));

const clients = [
  {
    id: "ECM-1001",
    name: "Arun Kumar",
    connectionType: "Residential",
    serviceStatus: "Active",
    monthlyKwh: 284,
    previousMonthlyKwh: 241,
    outstandingAmount: 420,
    lastPayment: "2026-09-18"
  },
  {
    id: "ECM-1002",
    name: "Priya Nair",
    connectionType: "Residential",
    serviceStatus: "Active",
    monthlyKwh: 176,
    previousMonthlyKwh: 181,
    outstandingAmount: 0,
    lastPayment: "2026-09-28"
  },
  {
    id: "ECM-1003",
    name: "GreenLeaf Foods",
    connectionType: "Commercial",
    serviceStatus: "Active",
    monthlyKwh: 1290,
    previousMonthlyKwh: 1108,
    outstandingAmount: 1850,
    lastPayment: "2026-09-09"
  }
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", claudeConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.get("/api/clients", (_req, res) => {
  res.json(clients);
});

app.get("/api/clients/:id", (req, res) => {
  const client = clients.find((item) => item.id === req.params.id);
  if (!client) return res.status(404).json({ error: "Client not found" });
  res.json(client);
});

app.post("/api/claude/ask", async (req, res) => {
  const { clientId, question } = req.body || {};

  if (!clientId || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "clientId and question are required" });
  }

  const client = clients.find((item) => item.id === clientId);
  if (!client) return res.status(404).json({ error: "Client not found" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: "Claude is not configured. Add ANTHROPIC_API_KEY to your .env file."
    });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const safeContext = {
    clientId: client.id,
    name: client.name,
    connectionType: client.connectionType,
    serviceStatus: client.serviceStatus,
    monthlyKwh: client.monthlyKwh,
    previousMonthlyKwh: client.previousMonthlyKwh,
    outstandingAmount: client.outstandingAmount,
    lastPayment: client.lastPayment
  };

  try {
    const response = await anthropic.messages.create({
      // Current Claude API model listed by Anthropic for fast workloads.
      model: "claude-haiku-4-5",
      max_tokens: 500,
      system:
        "You are an electricity client-support assistant. Use only the supplied client context. Be concise and clear. Do not invent account facts, make binding financial decisions, or bypass access controls. When discussing unusual usage, explain that the observation is informational.",
      messages: [
        {
          role: "user",
          content:
            "Client context:\n" +
            JSON.stringify(safeContext, null, 2) +
            "\n\nUser question:\n" +
            question.trim()
        }
      ]
    });

    const answer = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ answer });
  } catch (error) {
    console.error("Claude API error:", error);
    res.status(502).json({
      error: "The AI assistant could not complete the request."
    });
  }
});

// Express 5 requires a named wildcard; this also matches "/".
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log("Electricity AI Client Management running on http://localhost:" + port);
});
