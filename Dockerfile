# Utilise une image Node.js officielle
FROM node:18-alpine

# Crée le dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste du code
COPY . .

# Expose le port utilisé par l'app
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "server.js"]
