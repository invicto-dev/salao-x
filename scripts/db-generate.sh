#!/bin/bash

BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Executando Prisma Generate...${NC}"

docker compose exec backend npx prisma generate

echo -e "${BLUE}Prisma Client gerado com sucesso.${NC}"