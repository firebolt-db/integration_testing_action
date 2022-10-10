from os import environ
from sys import argv

from firebolt.client.auth import UsernamePassword
from firebolt.common.settings import Settings
from firebolt.service.manager import ResourceManager


def get_cheapest_instance(rm: ResourceManager) -> str:
    instance_list = rm.instance_types.instance_types
    # Filter out instances without storage
    instance_list = [
        i for i in instance_list if i.storage_size_bytes and i.storage_size_bytes != "0"
    ]
    cheapest = min(instance_list, key=lambda x: x.price_per_hour_cents)
    return cheapest


if __name__ == "__main__":
    rm = ResourceManager(Settings(auth=UsernamePassword(
        environ["FIREBOLT_USER"], environ["FIREBOLT_PASSWORD"]), user=None, password=None))

    if len(argv) < 2:
        raise RuntimeError("db_name argument should be provided")
    database_name = argv[1]

    engine_name = database_name
    database = rm.databases.get_by_name(database_name)

    instance_spec = environ.get("FIREBOLT_ENGINE_SPEC")
    if not instance_spec:
        instance_spec = get_cheapest_instance(rm).name

    engine = rm.engines.create(engine_name, scale=1, spec=instance_spec)
    engine.attach_to_database(database, True)
    engine.start()

    # No start needed, stopped engine should always be stopped
    stopped_engine_name = engine_name + "_stopped"
    stopped_engine = rm.engines.create(
        stopped_engine_name, scale=1, spec=instance_spec)
    stopped_engine.attach_to_database(database, False)

    print(engine.name, engine.endpoint,
          stopped_engine.name, stopped_engine.endpoint)
