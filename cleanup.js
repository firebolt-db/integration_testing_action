const core = require('@actions/core');
const sdk = require('firebolt-sdk');
//import * as core from '@actions/core';
//import { Firebolt } from 'firebolt-sdk';

const firebolt = sdk.Firebolt({apiEndpoint: core.getInput('api-endpoint')});
const connection = await firebolt.connect({
  auth: {
    client_id: core.getInput('firebolt-client-id'),
    client_secret: core.getInput('firebolt-client-secret'),
  },
  account: core.getInput('account')
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