#!/bin/bash

PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}Populando o banco de dados (seeding)...${NC}"

docker compose exec backend npm run db:seed

echo -e "${PURPLE}Banco de dados populado.${NC}"