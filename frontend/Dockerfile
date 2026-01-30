# Estágio 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# --- CORREÇÃO AQUI ---
# Recebe a variável de argumento do build
ARG VITE_API_URL
# Torna disponível para o comando de build
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Estágio 2: Servidor Web (Nginx)
FROM nginx:alpine AS runner

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]