# ==========================================
# Étape 1 : Compilation de l'application Angular
# ==========================================
FROM node:20-alpine AS build

# Définition du dossier de travail
WORKDIR /usr/local/app

# Copie des fichiers de dépendances pour optimiser le cache Docker
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du reste du code source
COPY ./ ./

# Génération du build de production
RUN npm run build --loglevel=error

# ==========================================
# Étape 2 : Serveur de production Nginx
# ==========================================
FROM nginx:alpine

# Suppression de la configuration et des fichiers HTML par défaut de Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf && rm -rf /usr/share/nginx/html/*

# Copie de notre configuration Nginx personnalisée pour le routage SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers compilés d'Angular (Le dossier /browser)
COPY --from=build /usr/local/app/dist/bill-front-ng/browser /usr/share/nginx/html

# Exposition du port web par défaut (requis par Docker Compose)
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]