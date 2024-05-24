#! /bin/bash

if [ "${CODESPACES}" == "true" ]; then
  # Set the default git repository if running in GitHub Codespaces
  recce github artifact

  # Check daily staging artifact files
  default_branch=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)
  daily_artifact_workflow_id=$(gh run list -w "${RECCE_DAILY_CI_WORKFLOW_NAME}" --status success -b dev --limit 1 --json databaseId | jq .[].databaseId)
  gh run download $daily_artifact_workflow_id --dir .recce
  if [ -d ".recce/dbt-artifacts" ]; then
    mv .recce/dbt-artifacts target-base
    echo "The daily staging artifact files are downloaded to 'target-base'."
  fi

  # Check environment variables
  bash .devcontainer/setup_required_env.sh

  bash .devcontainer/prepare_dbt_manifest.sh

  bash .devcontainer/launch_recce_server.sh

fi