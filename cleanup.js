const core = require('@actions/core');
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

const database_name = core.getState('database_name');
const engine_name = core.getState('engine_name');
const stopped_engine_name = core.getState('stopped_engine_name');

let failed = false;

try {
  const engine = await retryWithBackoff(async () => {
    return await firebolt.resourceManager.engine.getByName(engine_name);
  });
  await retryWithBackoff(async () => {
    await engine.stop();
  });
  await retryWithBackoff(async () => {
    await engine.delete();
  });
} catch (e) {
  failed = true;
  core.info('failed to cleanup engine: ' + e);
}

try {
  const stopped_engine = await retryWithBackoff(async () => {
    return await firebolt.resourceManager.engine.getByName(stopped_engine_name);
  });
  await retryWithBackoff(async () => {
    await stopped_engine.delete();
  });
} catch (e) {
    failed = true;
    core.info('failed to cleanup stopped engine: ' + e);
}

try {
  const database = await retryWithBackoff(async () => {
    return await firebolt.resourceManager.database.getByName(database_name);
  });
  await retryWithBackoff(async () => {
    await database.delete();
  });
} catch (e) {
    failed = true;
    core.info('failed to cleanup database: ' + e);
}

if (failed) {
  core.setFailed('failed to cleanup resources');
}
