from time import time
from sys import argv

from firebolt.common.settings import Settings
from firebolt.service.manager import ResourceManager

if __name__ == "__main__":
    rm = ResourceManager(Settings())
    suffix = argv[0] if len(argv) > 0 else ""
    database_name = f"integration_testing_{suffix}_{int(time())}"
    rm.databases.create(database_name)
    print(database_name)
