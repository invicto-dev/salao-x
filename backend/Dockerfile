# Estágio 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Compila o projeto (Isso deve gerar o dist/ com todo o código, incluindo utils/seed.js)
RUN npm run build

# Estágio 2: Produção
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências de produção
RUN npm ci --only=production && npm cache clean --force

RUN npx prisma generate

# Copia todo o código compilado (incluindo o seed compilado)
COPY --from=builder /app/dist ./dist

# Cria pastas e ajusta permissões
RUN mkdir -p tmp/uploads && chown -R node:node /app

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
USER node

ENTRYPOINT ["./entrypoint.sh"]