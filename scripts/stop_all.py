from os import environ
from sys import argv
from time import sleep

from firebolt.client.auth import ClientCredentials
from firebolt.model.engine import Engine
from firebolt.service.manager import ResourceManager
from firebolt.service.types import EngineStatus
from firebolt.utils.exception import EngineNotFoundError
from httpx import HTTPStatusError
from retry import retry

WAIT_SLEEP_SECONDS = 5


@retry(HTTPStatusError, tries=3, delay=1, backoff=2)
def engine_wait_stop(engine: Engine) -> None:
    engine.stop()
    while (engine.current_status!= EngineStatus.STOPPED):
        sleep(WAIT_SLEEP_SECONDS)
        engine.refresh()


@retry(HTTPStatusError, tries=3, delay=1, backoff=2)
def engine_wait_delete(engine: Engine, rm: ResourceManager) -> None:
    engine.delete()
    try:
        while rm.engines.get(engine.name):
            sleep(WAIT_SLEEP_SECONDS)
    except EngineNotFoundError:  # Happens when we are unable to find the engine
        pass


if __name__ == "__main__":
    rm = ResourceManager(
        auth=ClientCredentials(
            environ["FIREBOLT_CLIENT_ID"],
            environ["FIREBOLT_CLIENT_SECRET"]
        ),
        account_name=environ["FIREBOLT_ACCOUNT"],
        api_endpoint=environ["FIREBOLT_SERVER"]
    )

    if len(argv) < 2:
        raise RuntimeError("database name argument  should be provided")
    database_name = argv[1]
    # Deleting running and stopped engines
    for engine_name in (database_name, database_name + "_stopped"):
        try:
            engine = rm.engines.get(engine_name)
        except EngineNotFoundError as e:
            pass
        else:
            engine_wait_stop(engine)
            engine_wait_delete(engine, rm)
    rm.databases.get(database_name).delete()
