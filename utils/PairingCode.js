const makeWASocket = require('@adiwajshing/baileys').default;
const { DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');

async function generatePairingCode(phoneNumber) {
  return new Promise(async (resolve, reject) => {
    // On utilise une auth temporaire en mémoire
    const { state, saveState } = useSingleFileAuthState(`./auth_${phoneNumber}.json`);

    const sock = makeWASocket({
      printQRInTerminal: false,
      auth: state,
      getMessage: async () => ({}),
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr, pairingData } = update;
      if (qr) {
        // Le QR ne sera pas affiché mais on ignore
      }
      if (pairingData) {
        // pairingData contient le code de couplage qu'on doit retourner
        const pairingCode = Buffer.from(pairingData).toString('base64');
        sock.logout().catch(() => {});
        resolve(pairingCode);
      }
      if (connection === 'close') {
        if (lastDisconnect.error && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
          reject(lastDisconnect.error);
        }
      }
    });

    sock.ev.on('creds.update', saveState);
  });
}

module.exports = { generatePairingCode };
