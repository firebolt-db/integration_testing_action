const core = require('@actions/core');

const instanceType = core.getInput('instance-type');
const engineScale = core.getInput('engine-scale');
const dbSuffix = core.getInput('db-suffix');

import { Firebolt } from 'firebolt-sdk';

const firebolt = Firebolt({
    apiEndpoint: core.getInput('api-endpoint'),
});

firebolt.connect({
    auth: {
        client_id: core.getInput('firebolt-client-id'),
        client_secret: core.getInput('firebolt-client-secret'),
    },
    account: core.getInput('account')
});

let dbName = `integration_testing_${dbSuffix}_${Date.now()}`;

let database = firebolt.resourceManager.database.create(dbName);
let engine = firebolt.resourceManager.engine.create(dbName, {scale: engineScale, spec: instanceType});
firebolt.resourceManager.engine.attachToDatabase(engine, database);
engine.start();