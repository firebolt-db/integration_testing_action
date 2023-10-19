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

const suffix = core.getInput('db_suffix').replaceAll(".", "").replaceAll("-", "");
const database_name = `integration_testing_${suffix}_${Date.now()}`;
const database = await firebolt.resourceManager.database.create(database_name);

core.setOutput('database_name', database.name);
core.saveState('database_name', database.name);

const engine_name = database_name;
const engine_spec = process.env.FIREBOLT_ENGINE_SPEC;
const engine_scale = parseInt(process.env.FIREBOLT_ENGINE_SCALE);
const engine = await firebolt.resourceManager.engine.create({name: engine_name, options: {spec: engine_spec, scale: engine_scale}});
await firebolt.resourceManager.engine.attachToDatabase(engine, database);
await engine.start();

//no start needed
const stopped_engine_name = engine_name + "_stopped"
const stopped_engine = await firebolt.resourceManager.engine.create({name: stopped_engine_name, options: {spec: engine_spec, scale: engine_scale}})
await firebolt.resourceManager.engine.attachToDatabase(stopped_engine, database);

core.setOutput('engine_name', engine.name);
core.saveState('engine_name', engine.name);
core.setOutput('engine_url', engine.endpoint);

core.setOutput('stopped_engine_name', stopped_engine.name);
core.saveState('stopped_engine_name', stopped_engine.name);
core.setOutput('stopped_engine_url', stopped_engine.endpoint);