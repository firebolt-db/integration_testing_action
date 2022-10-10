from os import environ
from sys import argv
from time import sleep

from firebolt.client.auth import UsernamePassword
from firebolt.common.settings import Settings
from firebolt.model.engine import Engine
from firebolt.service.manager import ResourceManager
from firebolt.service.types import EngineStatusSummary
from httpx import HTTPStatusError
from retry import retry

WAIT_SLEEP_SECONDS = 5


@retry(HTTPStatusError, tries=3, delay=1, backoff=2)
def engine_wait_stop(engine: Engine) -> None:
    engine.stop()
    while (
        engine.current_status_summary
        != EngineStatusSummary.ENGINE_STATUS_SUMMARY_STOPPED
    ):
        sleep(WAIT_SLEEP_SECONDS)
        engine = engine.get_latest()


@retry(HTTPStatusError, tries=3, delay=1, backoff=2)
def engine_wait_delete(engine: Engine, rm: ResourceManager) -> None:
    engine.delete()
    try:
        while rm.engines.get_by_name(engine.name):
            sleep(WAIT_SLEEP_SECONDS)
    except RuntimeError:  # Happend when we are unable to find the engine
        pass


if __name__ == "__main__":
    rm = ResourceManager(Settings(auth=UsernamePassword(
        environ["FIREBOLT_USER"], environ["FIREBOLT_PASSWORD"]), user=None, password=None))

    if len(argv) < 2:
        raise RuntimeError("database name argument  should be provided")
    database_name = argv[1]
    # Deleting running and stopped engines
    for engine_name in (database_name, database_name + "_stopped"):
        try:
            engine = rm.engines.get_by_name(engine_name)
        except RuntimeError as e:
            # Ignore non existing engine error, still need to drop the db
            if "Record not found" not in str(e):
                raise e
        else:
            engine_wait_stop(engine)
            engine_wait_delete(engine, rm)
    rm.databases.get_by_name(database_name).delete()
