#!/bin/bash

CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Se um argumento for passado (ex: ./scripts/logs.sh backend), mostra os logs apenas desse serviço
if [ -z "$1" ]; then
  echo -e "${CYAN}Mostrando logs de todos os serviços... (Pressione Ctrl+C para sair)${NC}"
  docker compose logs -f
else
  echo -e "${CYAN}Mostrando logs do serviço '$1'... (Pressione Ctrl+C para sair)${NC}"
  docker compose logs -f "$1"
fi