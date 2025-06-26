const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

// Remplace cette image par la tienne
const IMAGE_URL = "https://files.catbox.moe/tr8qs8.jpg";

function generatePairingCode(phoneNumber) {
  // Exemple simple : hash basique (à adapter)
  const base = phoneNumber + Date.now();
  return Buffer.from(base).toString('base64').slice(0, 16);
}

app.get('/', (req, res) => {
  res.render('index', { imageUrl: IMAGE_URL, pairingCode: null, phone: null });
});

app.post('/generate', (req, res) => {
  const phone = req.body.phone;
  if (!phone) {
    return res.render('index', { imageUrl: IMAGE_URL, pairingCode: null, phone: null, error: "Veuillez saisir un numéro." });
  }
  const pairingCode = generatePairingCode(phone);
  res.render('index', { imageUrl: IMAGE_URL, pairingCode, phone, error: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
