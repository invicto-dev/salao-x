FROM node:18-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y libssl-dev

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm prune --production


FROM node:18-slim as runner

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y libssl-dev

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]