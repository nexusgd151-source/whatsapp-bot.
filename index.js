const express = require("express");

const app = express();

// VARIABLES
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// MIDDLEWARE
app.use(express.json());

// RUTA DE PRUEBA
app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// VERIFICACIÓN WEBHOOK
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// RECIBIR MENSAJES
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from; // número del cliente
    const text = message.text?.body?.toLowerCase();

    console.log("📩 Mensaje recibido:", text);

    // RESPUESTA AUTOMÁTICA
    await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: `🍕 ¡Bienvenido a Pizzería Villa!

Elige una opción:
1️⃣ Ver menú
2️⃣ Hacer pedido
3️⃣ Horarios y ubicación`,
        },
      }),
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error:", error);
    res.sendStatus(500);
  }
});

// SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
