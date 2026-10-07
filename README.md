# Electricity AI Client Management

An early-stage web application for managing electricity clients and providing an AI-assisted support experience.

## What it does

The prototype provides:

- Client records with account, service, and usage information
- Search and selection of clients
- A simple role-aware dashboard
- Electricity usage summaries
- An AI assistant powered by the Claude API
- A secure backend pattern where the Claude API key stays on the server

## Claude use case

Claude is used as an optional assistant for authorized application data. The assistant can:

1. Explain electricity usage in simple language.
2. Summarize a client's recent usage.
3. Answer questions about the selected client's permitted account information.
4. Suggest non-binding actions when unusual usage is visible.

The browser never receives the Anthropic API key. The backend sends only the selected client's limited application context to Claude.

## Architecture

```
Browser
   |
   v
Express API
   |---- Client data
   |
   +---- Claude API
```

## Tech stack

- Node.js
- Express
- Vanilla HTML/CSS/JavaScript
- Anthropic Claude API

## Run locally

1. Install Node.js 18+.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env`.
4. Add your Anthropic API key to `ANTHROPIC_API_KEY`.
5. Start the server:

```bash
npm start
```

6. Open `http://localhost:3000`.

## Environment variables

```text
ANTHROPIC_API_KEY=your_key_here
PORT=3000
```

## Security notes

This is a prototype. Real deployments should add production authentication, authorization, persistent storage, audit logging, rate limiting, input validation, HTTPS, secret management, and a stricter data-minimization policy before handling real customer information.

## Project status

Early-stage working prototype.

## Roadmap

- [x] Client dashboard prototype
- [x] Usage summary view
- [x] Claude assistant endpoint
- [ ] Real authentication
- [ ] Role-based authorization
- [ ] Persistent database
- [ ] Usage anomaly detection
- [ ] Automated tests
- [ ] Production deployment
- [ ] Audit logs

## License

MIT
