const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const fs = require('fs');

async function generatePairingCode(number) {
    const { state, saveState } = useSingleFileAuthState(`./session/${number}.json`);
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, pairingCode } = update;
        if (connection === 'open') {
            console.log('✅ Connected!');
        }
        if (pairingCode) {
            fs.writeFileSync(`./session/${number}.txt`, pairingCode);
        }
    });

    await sock.waitForConnectionUpdate(u => !!u.pairingCode);
    const code = fs.readFileSync(`./session/${number}.txt`, 'utf-8');
    return code;
}

module.exports = { generatePairingCode };
