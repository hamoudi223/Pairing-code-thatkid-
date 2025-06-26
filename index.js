import express from "express";
import { Boom } from "@hapi/boom";
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, DisconnectReason, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import qrcode from "qrcode";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Site de génération de Pairing Code en ligne ✅");
});

app.get("/pair", async (req, res) => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["Pairing-Code-Site", "Chrome", "1.0.0"],
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    if (qr) {
      qrcode.toDataURL(qr, (err, url) => {
        res.send(`<html><body style="text-align:center;">
          <h2>Scannez ce QR Code dans WhatsApp</h2>
          <img src="${url}" width="250"/>
          <br><br><p>Ouvrez WhatsApp > Appareils connectés > Lier un appareil</p>
          </body></html>`);
      });
    }
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) sock = startSock();
    }
    if (connection === "open") {
      console.log("✅ Connecté à WhatsApp");
    }
  });

  sock.ev.on("creds.update", saveCreds);
});

app.listen(port, () => {
  console.log("✅ Serveur lancé sur le port", port);
});