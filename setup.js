const core = require('@actions/core');

const instanceType = core.getInput('instance-type');
const engineScale = parseInt(core.getInput('engine-scale'));
const suffix = core.getInput('db_suffix').replaceAll(".", "").replaceAll("-", "");


import { Firebolt } from 'firebolt-sdk';

const firebolt = Firebolt({
    apiEndpoint: core.getInput('api-endpoint'),
});

await firebolt.connect({
    auth: {
        client_id: core.getInput('firebolt-client-id'),
        client_secret: core.getInput('firebolt-client-secret'),
    },
    account: core.getInput('account')
});

const databaseName = `integration_testing_${suffix}_${Date.now()}`;

let database;
(async () => {
  // Setting not user-facing settings
  if (core.getInput('engine-version')) {
    console.info(`Setting engine version to ${core.getInput('engine-version')}`);
    process.env.FB_INTERNAL_OPTIONS_ENGINE_VERSION = core.getInput('engine-version');
  } else {
    console.info(`Using default engine version`);
  }
  database = await firebolt.resourceManager.database.create(databaseName);
})();

core.setOutput('database_name', database.name);
core.saveState('database_name', database.name);

let engine = await firebolt.resourceManager.engine.create(databaseName, {
    scale: engineScale,
    spec: instanceType
});
await firebolt.resourceManager.engine.attachToDatabase(engine, database);

const stoppedEngineName = databaseName + "_stopped"
const stoppedEngine = await firebolt.resourceManager.engine.create(stoppedEngineName, {
    scale: engineScale,
    spec: instanceType
});
await firebolt.resourceManager.engine.attachToDatabase(stoppedEngine, database);

await engine.start();

core.setOutput('engine_name', engine.name);
core.saveState('engine_name', engine.name);
core.setOutput('engine_url', engine.endpoint);

core.setOutput('stopped_engine_name', stoppedEngine.name);
core.saveState('stopped_engine_name', stoppedEngine.name);
core.setOutput('stopped_engine_url', stoppedEngine.endpoint);