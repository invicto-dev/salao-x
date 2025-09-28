#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Subindo os contêineres Docker...${NC}"

docker compose up -d --build

echo -e "${GREEN}Ambiente iniciado com sucesso!${NC}"
echo "Frontend disponível em: http://localhost:5173"
echo "Backend disponível em: http://localhost:3000"