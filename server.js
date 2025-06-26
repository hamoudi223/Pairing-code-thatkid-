const express = require('express');
const bodyParser = require('body-parser');
const { generatePairingCode } = require('./utils/pairingCode');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/generate', async (req, res) => {
    const number = req.body.number;
    try {
        const code = await generatePairingCode(number);
        res.send(`<h2>Voici votre Pairing Code :</h2><p>${code}</p>`);
    } catch (err) {
        res.status(500).send('Erreur lors de la génération du code.');
    }
});

app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
});
