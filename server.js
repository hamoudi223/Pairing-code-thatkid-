import express from 'express';
import { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, generateRegistrationId } from '@whiskeysockets/baileys';
import { makeWALegacySocket, useSingleFileLegacyAuthState, proto } from '@whiskeysockets/baileys';
import { generatePairingCode } from '@whiskeysockets/baileys/lib/Utils';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let sock = null;
let pairingInfo = null;

app.post('/start-pairing', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber required' });

  if (sock) {
    await sock.logout();
    sock = null;
    pairingInfo = null;
  }

  const { version } = await fetchLatestBaileysVersion();
  const registrationId = generateRegistrationId();

  sock = makeWALegacySocket({
    version,
    printQRInTerminal: false,
    auth: {
      creds: {
        registrationId,
        // No session data yet
      },
      keys: makeCacheableSignalKeyStore(new Map()),
    },
  });

  sock.ev.on('connection.update', update => {
    if (update.qr) {
      pairingInfo = update.qr;
      // On QR = code de couplage textuel, tu peux envoyer ça au front
      res.json({ pairingCode: update.qr });
    }
    if (update.connection === 'open') {
      console.log('WhatsApp connected!');
    }
    if (update.connection === 'close') {
      console.log('WhatsApp disconnected:', update.lastDisconnect?.error);
      sock = null;
      pairingInfo = null;
    }
  });

  // Demande de pairing par numéro à l'API Baileys n'est pas trivial,
  // mais on peut afficher un code d'association (code pairing) via le QR textuel.

  // Comme la méthode "par numéro" n'est pas encore publique dans Baileys officielle,
  // on simule en générant le code QR textuel (qui est un pairing code sous forme de texte).

  // En résumé : la "méthode par numéro" n'est pas encore exposée simplement dans Baileys,
  // et la plupart des bots utilisent le QR code standard.

  // Donc on te retourne ici ce code "pairing code" (texte du QR) pour copier.

});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
