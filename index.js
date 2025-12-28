const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = "mi_token_secreto";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// VERIFICACIÓN DEL WEBHOOK
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// RECEPCIÓN DE MENSAJES
app.post("/webhook", (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;

    console.log("📩 Mensaje recibido");
    console.log("De:", from);
    console.log("Texto:", text);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
