#!/bin/bash

BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Executando Prisma Migrate Dev...${NC}"

docker compose exec backend npx prisma migrate dev --name "$1"

echo -e "${BLUE}Migração finalizada.${NC}"