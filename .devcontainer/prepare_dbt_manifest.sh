#! /bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Check if the dbt's target path is existed
if [ -f "${DIR}/../recce_state.json" ]; then
    echo "The Recce state file is found. Skip preparing the dbt manifest."
    exit 0
fi

echo "Preparing the dbt manifest."
pushd ${DIR}/../
dbt deps && dbt build && dbt docs generate
popd
