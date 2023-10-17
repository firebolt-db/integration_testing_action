const core = require('@actions/core');
import { Firebolt } from 'firebolt-sdk';

const firebolt = Firebolt();
const connection = await firebolt.connect({
  auth: {
    client_id: process.env.FIREBOLT_CLIENT_ID,
    client_secret: process.env.FIREBOLT_CLIENT_SECRET,
  },
  account: process.env.FIREBOLT_ACCOUNT,
  database: process.env.FIREBOLT_DATABASE,
  engineName: process.env.FIREBOLT_ENGINE_NAME
});

const database_name = core.getState('database_name');
const engine_name = database_name;
const stopped_engine_name = database_name + "_stopped";

const engine = await firebolt.resourceManager.engine.getByName(engine_name);
await engine.stop();
await engine.delete();

const stopped_engine = await firebolt.resourceManager.engine.getByName(stopped_engine_name);
await stopped_engine.delete();

const database = await firebolt.resourceManager.database.getByName(database_name);
await database.delete();