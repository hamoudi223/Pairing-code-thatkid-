import makeWASocket, { useSingleFileAuthState } from '@whiskeysockets/baileys'
import P from 'pino'
import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

// Crée le dossier sessions s'il n'existe pas
if (!fs.existsSync('./sessions')) {
  fs.mkdirSync('./sessions')
}

// Stockage des connexions actives, indexé par numéro
const sessions = {}

/**
 * Initialise Baileys pour un numéro donné
 * @param {string} number
 * @returns {Promise<{qr: string | null}>} retourne un QR code en base64 ou null si déjà connecté
 */
async function startConnection(number) {
  const fileName = `./sessions/THATBOTZ_${number}_auth_info.json`
  
  // Crée l'auth state (gère le chargement / sauvegarde automatique)
  const { state, saveState } = useSingleFileAuthState(fileName)
  
  const sock = makeWASocket({
    logger: P({ level: 'info' }),
    auth: state,
    printQRInTerminal: false,
  })

  sock.ev.on('creds.update', saveState)

  return new Promise((resolve, reject) => {
    let qrSent = false

    sock.ev.on('connection.update', (update) => {
      const { connection, qr, lastDisconnect } = update
      
      if (qr && !qrSent) {
        qrSent = true
        // Envoie le QR code encodé en base64
        resolve({ qr })
      }
      
      if (connection === 'open') {
        console.log(`[${number}] Connecté avec succès.`)
        sessions[number] = sock
        resolve({ qr: null }) // plus besoin du QR
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        if (statusCode === 401) {
          console.log(`[${number}] Session invalide, veuillez reconnecter.`)
          delete sessions[number]
          reject(new Error('Session invalide (401).'))
        } else {
          console.log(`[${number}] Déconnecté, tentative de reconnexion...`)
          startConnection(number).catch(console.error)
        }
      }
    })
  })
}

// Endpoint pour générer la connexion et récupérer le QR code
app.post('/generate-qr', async (req, res) => {
  const { number } = req.body
  if (!number) return res.status(400).json({ error: 'Numéro manquant' })
  
  try {
    // Si la session existe et est connectée, pas besoin de QR
    if (sessions[number]) {
      return res.json({ qr: null, message: 'Déjà connecté' })
    }
    
    const { qr } = await startConnection(number)
    
    // QR est une chaîne base64 PNG (normalement)
    res.json({ qr })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Endpoint pour récupérer l'état de la session (exemple)
app.get('/session/:number', (req, res) => {
  const { number } = req.params
  const fileName = `./sessions/THATBOTZ_${number}_auth_info.json`
  
  if (!fs.existsSync(fileName)) {
    return res.status(404).json({ error: 'Session non trouvée' })
  }
  
  const content = fs.readFileSync(fileName, 'utf-8')
  res.type('application/json').send(content)
})

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
})
