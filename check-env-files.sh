#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Environment File Security Check Tool   ${NC}"
echo -e "${BLUE}===========================================${NC}"
echo

# Search for .env files (excluding .env.example files)
echo -e "${YELLOW}Searching for .env files...${NC}"
ENV_FILES=$(find . -name ".env*" -not -name "*.example" -not -path "*/node_modules/*" -not -path "*/\.*")

if [ -z "$ENV_FILES" ]; then
  echo -e "${GREEN}No .env files found! Your project is safe to push.${NC}"
else
  echo -e "${RED}WARNING: Found .env files that may contain sensitive data:${NC}"
  echo "$ENV_FILES"
  echo
  echo -e "${YELLOW}These files might contain sensitive information like:${NC}"
  echo "  - API keys"
  echo "  - Database credentials"
  echo "  - Access tokens"
  echo "  - Other secrets"
  echo
  echo -e "${YELLOW}Options:${NC}"
  echo "  1. Remove all found .env files"
  echo "  2. Review each file manually"
  echo "  3. Exit without changes"
  echo
  read -p "What would you like to do? (1/2/3): " CHOICE
  
  case $CHOICE in
    1)
      echo -e "${YELLOW}Removing all .env files...${NC}"
      for file in $ENV_FILES; do
        rm "$file"
        echo "Removed: $file"
      done
      echo -e "${GREEN}All .env files have been removed.${NC}"
      ;;
    2)
      echo -e "${YELLOW}Let's review each file:${NC}"
      for file in $ENV_FILES; do
        echo -e "${BLUE}----------------------------------------${NC}"
        echo -e "${YELLOW}File: $file${NC}"
        echo -e "${BLUE}----------------------------------------${NC}"
        cat "$file"
        echo
        read -p "Delete this file? (y/n): " DELETE
        if [[ $DELETE == "y" || $DELETE == "Y" ]]; then
          rm "$file"
          echo "Removed: $file"
        else
          echo "Kept: $file"
        fi
      done
      ;;
    *)
      echo -e "${YELLOW}No changes made. Please handle .env files manually before pushing to GitHub.${NC}"
      ;;
  esac
fi

echo
echo -e "${YELLOW}Checking for environment example files...${NC}"
BACKEND_EXAMPLE="./env-examples/backend.env.example"
FRONTEND_EXAMPLE="./env-examples/frontend.env.example"

if [ ! -f "$BACKEND_EXAMPLE" ]; then
  echo -e "${RED}Missing: $BACKEND_EXAMPLE${NC}"
  echo -e "${YELLOW}You should create the backend environment example file with placeholder values.${NC}"
fi

if [ ! -f "$FRONTEND_EXAMPLE" ]; then
  echo -e "${RED}Missing: $FRONTEND_EXAMPLE${NC}"
  echo -e "${YELLOW}You should create the frontend environment example file with placeholder values.${NC}"
fi

if [ -f "$BACKEND_EXAMPLE" ] && [ -f "$FRONTEND_EXAMPLE" ]; then
  echo -e "${GREEN}Both environment example files exist. Good!${NC}"
fi

echo
echo -e "${BLUE}===========================================${NC}"
echo -e "${GREEN}Security check complete!${NC}"
echo -e "${BLUE}===========================================${NC}" 