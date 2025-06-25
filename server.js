// server.js
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// 1) CORS + JSON parsing
app.use(cors());
app.use(express.json());

// 2) Serve static files from /public at root (/)
app.use(express.static(path.join(__dirname, 'public')));

// 3) Proxy /api/chat → LLaMA
const LLaMA_API_KEY = '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';
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }
  try {
    const llamaRes = await fetch('https://api.llama.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLaMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-2-13b-chat',
        messages,
      }),
    });
    const data = await llamaRes.json();
    if (!llamaRes.ok) {
      return res.status(llamaRes.status).json({ error: data.error || 'LLaMA API error' });
    }
    res.json({ answer: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4) Fallback for client‐side routes: send index.html
app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}/`)
);
