const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", { config });
});

app.post("/generate", (req, res) => {
  const number = req.body.number || "numéro inconnu";
  const pairingCode = `PAIRING-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  res.render("index", { config, pairingCode, number });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));