# Utilise une image officielle Node.js
FROM node:18

# Crée un dossier pour l'app
WORKDIR /app

# Copie les fichiers du projet
COPY . .

# Installe les dépendances
RUN npm install

# Expose le port (si tu utilises 3000)
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
