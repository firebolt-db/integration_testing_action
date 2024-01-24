from os import environ
from sys import argv
from time import time

from firebolt.client.auth import UsernamePassword
from firebolt.common.settings import Settings
from firebolt.service.manager import ResourceManager

if __name__ == "__main__":
    print("++++PYTHON HERE" + environ["FIREBOLT_PASSWORD"])
    rm = ResourceManager(Settings(auth=UsernamePassword(
        environ["FIREBOLT_USER"], environ["FIREBOLT_PASSWORD"]), user=None, password=None))
    suffix = argv[1] if len(argv) >= 2 else ""
    suffix = suffix.replace(".", "").replace("-", "")
    database_name = f"integration_testing_{suffix}_{int(time())}"
    rm.databases.create(database_name)
    print(database_name)
