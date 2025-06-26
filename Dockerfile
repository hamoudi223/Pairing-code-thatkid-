# Utilise une image Node.js officielle
FROM node:18

# Dossier de travail dans le container
WORKDIR /app

# Copier les fichiers package.json et package-lock.json (si présent)
COPY package.json package-lock.json* ./

# Installer les dépendances (avec npm)
RUN npm install --legacy-peer-deps

# Copier le reste du code source
COPY . .

# Exposer le port 3000 (ou autre selon ton app)
EXPOSE 3000

# Commande pour démarrer le serveur Node.js
CMD ["node", "server.js"]
