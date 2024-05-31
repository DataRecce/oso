#! /bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

pip install -U recce-nightly

if [ -f "${DIR}/../recce_state.json" ]; then
    echo "Launching the Recce server in review mode. The Recce state file is found."
    recce server --review ${DIR}/../recce_state.json
else
    if [ -f "${DBT_GOOGLE_KEYFILE}" ]; then
        echo "Preparing the dbt manifest."
        pushd ${DIR}/../
        dbt deps && dbt build && dbt docs generate
        popd
        echo "Launching the Recce server."
        recce server
    else
        echo "Google cloud service account key is not found. Skip launching the Recce server."
    fi
fi