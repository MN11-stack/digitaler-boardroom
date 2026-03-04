# KI-CFO Frontend

AI-gestützter Chief Financial Officer - Chat Interface

## Features

- 💬 Chat-Interface für Finanzfragen
- 🎨 Moderne UI mit Tailwind CSS
- 🚀 Next.js 14 mit TypeScript
- 🔄 Integration mit n8n Workflow (RAG-Pipeline)
- 📊 Qdrant Vektordatenbank für CFO-Wissen

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

## Environment Variables

Create `.env.local`:

```
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/ki-cfo
```

## Architecture

```
User → Next.js Frontend → n8n Workflow → Qdrant + Claude API
```
