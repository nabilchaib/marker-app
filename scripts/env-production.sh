#!/bin/bash

# Define the project ID you want to check and switch to
PROJECT_ID="hoop-trackr"
PATH_TO_ENV="./environments/production"
ENV_FILE_NAME=".env.production"

# Formatting colors
GREEN="\033[1;32m"
RESET="\033[0m"

echo "Modifying env for production..."

if [ ! -f "$PATH_TO_ENV/$ENV_FILE_NAME" ]; then
  echo "Your $ENV_FILE_NAME file is missing in your $PATH_TO_ENV directory. Exiting."
  exit 1
fi

if [ ! -f "$PATH_TO_ENV/.firebaserc" ]; then
  echo "Your .firebaserc file is missing in your $PATH_TO_ENV directory. Exiting."
  exit 1
fi

if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI is not installed. Please install it with:"
  echo -e "${GREEN}npm install -g firebase-tools${RESET}"
  echo "Exiting."
  exit 1
fi

# Get the list of projects
# PROJECT_LIST=$(firebase projects:list > /dev/null 2>&1)
PROJECT_LIST=$(firebase projects:list 2>&1)

if echo "$PROJECT_LIST" | grep -q "Error"; then
  echo "User is not logged into firebase. Please log in with:"
  echo -e "${GREEN}firebase login${RESET}" 
  echo "Exiting."
  exit 1
fi

if ! echo "$PROJECT_LIST" | grep -q "$PROJECT_ID"; then
  echo "Project '$PROJECT_ID' does not exist. Exiting."
  exit 1
fi

echo "Project '$PROJECT_ID' exists. Switching to the project..."
cp ./environments/production/.firebaserc ./
cp ./environments/production/.env.production ./.env
firebase use "$PROJECT_ID"

echo "Done."
