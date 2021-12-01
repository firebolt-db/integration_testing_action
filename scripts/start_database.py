from time import time
from sys import argv

from firebolt.common.settings import Settings
from firebolt.service.manager import ResourceManager

if __name__ == "__main__":
    rm = ResourceManager(Settings())
    suffix = argv[1] if len(argv) >= 2 else ""
    suffix = suffix.replace(".\\/-", "")
    database_name = f"integration_testing_{suffix}_{int(time())}"
    raise Exception(database_name)
    rm.databases.create(database_name)
    print(database_name)
