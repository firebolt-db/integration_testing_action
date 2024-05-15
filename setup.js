const core = require('@actions/core');

const instanceType = core.getInput('instance-type');
const engineScale = parseInt(core.getInput('engine-scale'));
const suffix = core.getInput('db_suffix').replaceAll(".", "").replaceAll("-", "");

import {Firebolt} from 'firebolt-sdk';
const { retryWithBackoff } = require('./util');

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
const database = await retryWithBackoff(async () => {
  return await firebolt.resourceManager.database.create(databaseName);
});

core.setOutput('database_name', database.name);
core.saveState('database_name', database.name);

// Create engine
const engine = await retryWithBackoff(async () => {
  return await firebolt.resourceManager.engine.create(databaseName, {
    scale: engineScale,
    spec: instanceType
  });
});

// Attach engine to database
await retryWithBackoff(async () => {
  await firebolt.resourceManager.engine.attachToDatabase(engine, database);
});

const stoppedEngineName = databaseName + "_stopped"
// Create stopped engine
const stoppedEngine = await retryWithBackoff(async () => {
  return await firebolt.resourceManager.engine.create(stoppedEngineName, {
    scale: engineScale,
    spec: instanceType
  });
});

// Attach stopped engine to database
await retryWithBackoff(async () => {
  await firebolt.resourceManager.engine.attachToDatabase(stoppedEngine, database);
});

// Start engine
await retryWithBackoff(async () => {
  await engine.start();
});

core.setOutput('engine_name', engine.name);
core.saveState('engine_name', engine.name);
core.setOutput('engine_url', engine.endpoint);

core.setOutput('stopped_engine_name', stoppedEngine.name);
core.saveState('stopped_engine_name', stoppedEngine.name);
core.setOutput('stopped_engine_url', stoppedEngine.endpoint);
