#!/bin/bash

YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Parando e removendo os contêineres...${NC}"

docker compose down

echo -e "${YELLOW}Ambiente finalizado.${NC}"