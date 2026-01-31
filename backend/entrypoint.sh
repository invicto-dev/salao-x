#!/bin/sh
set -e

echo "🚀 Iniciando setup de produção..."

echo "📦 Aplicando migrations..."
npx prisma migrate deploy

echo "🌱 Verificando/Criando dados iniciais (Seed)..."
# MUDANÇA AQUI: Rodamos o arquivo JS compilado em vez do TS
node dist/utils/seed.js

echo "🔥 Iniciando servidor..."
exec node dist/server.js