const express = require("express");
const axios = require("axios");

const app = express();

// =======================
// VARIABLES DE ENTORNO
// =======================
const PORT = process.env.PORT || 8080;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());

// =======================
// RUTA DE PRUEBA
// =======================
app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});

// =======================
// VERIFICACIÓN DEL WEBHOOK (META)
// =======================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado");
    return res.status(200).send(challenge);
  } else {
    console.log("❌ Verificación fallida");
    return res.sendStatus(403);
  }
});

// =======================
// RECEPCIÓN DE MENSAJES
// =======================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // Si no hay mensaje, salir
    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from; // número del usuario
    const text = message.text?.body?.toLowerCase();

    console.log("📩 Mensaje recibido:", text);

    // RESPUESTA AUTOMÁTICA
    if (text === "hola") {
      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body:
              "👋 ¡Hola! Soy el bot de *Pizzas Villa* 🍕\n\n" +
              "Escribe *menu* para ver las opciones disponibles."
          }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(
      "❌ Error en webhook:",
      error.response?.data || error.message
    );
    res.sendStatus(200);
  }
});

// =======================
// SERVIDOR
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

