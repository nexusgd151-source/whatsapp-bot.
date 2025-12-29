const express = require("express");
const app = express();

// VARIABLES
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = "mi_token_secreto"; // 👈 EL MISMO que pusiste en Meta

// MIDDLEWARE
app.use(express.json());

// RUTA DE PRUEBA
app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// VERIFICACIÓN DEL WEBHOOK (META)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Verificación fallida");
    res.sendStatus(403);
  }
});

// RECEPCIÓN DE MENSAJES (DEBUG)
app.post("/webhook", (req, res) => {
  console.log("🔥 WEBHOOK HIT");
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

