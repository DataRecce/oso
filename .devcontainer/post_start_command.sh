#! /bin/bash

if [ "${CODESPACES}" == "true" ]; then
  # Download github actions artifacts
  bash .devcontainer/github_codespace_env.sh
  
  # Check environment variables
  bash .devcontainer/setup_required_env.sh

  bash .devcontainer/launch_recce_server.sh

fi