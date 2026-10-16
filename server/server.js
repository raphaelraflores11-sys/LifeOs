const express = require("express");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Read the API key from the environment only. Never hardcode it.
const apiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (apiKey && apiKey !== "your-openai-api-key-here") {
  openai = new OpenAI({ apiKey });
} else {
  console.warn(
    "Warning: OPENAI_API_KEY is not set. The server will run, but AI features will be unavailable."
  );
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "LifeOS backend is running",
    openaiConfigured: Boolean(openai),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`LifeOS backend listening on port ${PORT}`);
});
