# Image officielle Node.js légère
FROM node:18-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (pour cache Docker)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port sur lequel tourne ton serveur (à adapter si nécessaire)
EXPOSE 3000

# Commande pour démarrer ton serveur Node.js (modifie "server.js" si nécessaire)
CMD ["node", "server.js"]
