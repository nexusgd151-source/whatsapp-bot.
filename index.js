import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/* ============================
   VERIFICACIÓN DE META (GET)
============================ */
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

/* ============================
   MENSAJES ENTRANTES (POST)
============================ */
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from; // número del cliente
    const text = message.text?.body;

    console.log("📩 Mensaje recibido:", text);

    // 👉 Mensaje automático de bienvenida
    await enviarMensaje(from, 
      `👋 ¡Hola! Bienvenido a *Pizzas de Villa* 🍕
      
1️⃣ Ordenar pizza  
2️⃣ Ver menú  
3️⃣ Hablar con un humano  

Responde con el número de la opción 😊`
    );

    res.sendStatus(200);

  } catch (error) {
    console.error("❌ Error:", error);
    res.sendStatus(500);
  }
});

/* ============================
   FUNCIÓN PARA ENVIAR MENSAJES
============================ */
async function enviarMensaje(to, body) {
  const url = `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body }
  };

  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

/* ============================
   SERVIDOR
============================ */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
