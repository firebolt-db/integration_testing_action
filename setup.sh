#!/bin/bash

set -e
db_name=$(python3 /scripts/start_database.py)

echo "::save-state name=database_name::$db_name"
echo "::set-output name=database_name::$db_name"

name_and_url=$(python3 /scripts/start_engine.py $db_name)
arr=($name_and_url)
engine_name="${arr[0]}"
engine_url="${arr[1]}"

echo "::save-state name=engine_name::$engine_name"
echo "::set-output name=engine_name::$engine_name"


echo "::set-output name=engine_url::$engine_url"
