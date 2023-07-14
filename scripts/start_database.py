from os import environ
from sys import argv
from time import time

from firebolt.client.auth import ClientCredentials
from firebolt.service.manager import ResourceManager

if __name__ == "__main__":
    rm = ResourceManager(
        auth=ClientCredentials(environ["FIREBOLT_CLIENT_ID"], environ["FIREBOLT_CLIENT_SECRET"]),
        account_name=environ["FIREBOLT_ACCOUNT"],
        api_endpoint=environ["FIREBOLT_SERVER"]
    )
    suffix = argv[1] if len(argv) >= 2 else ""
    suffix = suffix.replace(".", "").replace("-", "")
    database_name = f"integration_testing_{suffix}_{int(time())}"
    rm.databases.create(database_name)
    print(database_name)
