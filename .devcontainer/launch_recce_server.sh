#! /bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

pip install -U recce-nightly

if [ -f "${DIR}/../recce_state.json" ]; then
    echo "Launching the Recce server in review mode. The Recce state file is found."
    recce server --review ${DIR}/../recce_state.json
else
    echo "Launching the Recce server."
    recce server
fi