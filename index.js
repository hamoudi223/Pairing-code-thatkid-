const express = require('express');
const { Boom } = require('@hapi/boom');
const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { delay } = require('@whiskeysockets/baileys/lib/Utils');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.json());

app.post('/api/pair', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Numéro requis' });

  const sessionDir = `./sessions/${Date.now()}`;
  fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['Koyeb Bot', 'Chrome', '4.0'],
  });

  sock.ev.on('connection.update', async ({ connection, qr, pairingCode }) => {
    if (pairingCode) {
      return res.json({ sessionId: pairingCode });
    }
    if (connection === 'open') {
      await delay(1000);
      sock.end();
    }
  });

  sock.ev.on('creds.update', saveCreds);
});

app.listen(PORT, () => console.log(`Serveur en ligne sur http://localhost:${PORT}`));
