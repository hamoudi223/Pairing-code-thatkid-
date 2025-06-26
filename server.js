import makeWASocket, { useSingleFileAuthState } from '@whiskeysockets/baileys'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3000

// Stockage session dans fichier local
const { state, saveState } = useSingleFileAuthState('./auth_info.json')

let sock = null

async function startSock() {
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  })

  sock.ev.on('connection.update', (update) => {
    const { connection } = update
    console.log('Connection status:', connection)
  })

  sock.ev.on('creds.update', saveState)
}

startSock()

// Endpoint pour générer un code pairing (6 chiffres) et envoyer message WhatsApp
app.post('/generate-code', async (req, res) => {
  const { number } = req.body
  if (!number) return res.status(400).json({ error: 'Numéro manquant' })

  // Génération code 6 chiffres aléatoire
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  try {
    // Envoie message dans ton propre chat WhatsApp (ton numéro doit être connecté)
    await sock.sendMessage(number + '@s.whatsapp.net', {
      text: `Ton code de couplage est : ${code}`,
    })

    res.json({ code })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' })
  }
})

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`)
})
