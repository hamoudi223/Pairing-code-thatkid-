const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { generatePairingCode } = require('./utils/pairingCode');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { pairingCode: null, error: null });
});

app.post('/generate', async (req, res) => {
  try {
    const number = req.body.number;
    if (!number || !number.match(/^\+?\d{8,15}$/)) {
      return res.render('index', { pairingCode: null, error: 'Numéro invalide. Format international requis, ex: +22395064497' });
    }
    const code = await generatePairingCode(number);
    res.render('index', { pairingCode: code, error: null });
  } catch (e) {
    console.error(e);
    res.render('index', { pairingCode: null, error: 'Erreur lors de la génération du code. Réessaie.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
