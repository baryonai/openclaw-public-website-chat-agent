# Website Chat Agent MVP

Minimal Next.js (TypeScript) starter for a website chat system.

## What’s included

- Landing page at `/`
- Simple chat UI at `/chat`
- API route stub at `/api/chat`
- Lightweight styling with no extra UI dependencies

## Project structure

```text
app/
  api/chat/route.ts   # stubbed chat endpoint
  chat/page.tsx       # chat demo UI
  globals.css         # shared styles
  layout.tsx          # app metadata/layout
  page.tsx            # landing page
```

## Run locally

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000` for the landing page
- `http://localhost:3000/chat` for the chat demo

## Build for production

```bash
npm run build
npm run start
```

## Notes

The chat page currently POSTs messages to `/api/chat`, which returns a stub reply using the latest user message. Replace `app/api/chat/route.ts` with your real LLM/backend integration when you’re ready.
