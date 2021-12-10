'use strict';

const core = require('@actions/core');
const { exec } = require("child_process");
const path = require('path');
const fb_env = {
  'FIREBOLT_USER': core.getInput('firebolt-username'),
  'FIREBOLT_PASSWORD': core.getInput('firebolt-password'),
  'FIREBOLT_SERVER': core.getInput('api-endpoint'),
  'FIREBOLT_DEFAULT_REGION': core.getInput('region')
};


function resolve_local_file(file_path) {
  return path.join(__dirname, file_path)
}

function stop_all(db_name, on_success, on_error) {
  python_bin = path.join(core.getState('python_path'), 'python');
  exec(python_bin + ' ' + resolve_local_file('scripts/stop_all.py') + ' ' + db_name,
    { env: fb_env },
    function(error, stdout, stderr) {
      error == null ? on_success(stdout) : on_error(error.message);
    });
}

try {
  stop_all(
    core.getState('database_name'),
    () => { },
    errMsg => core.setFailed(errMsg)
  );

} catch (error) {
  core.setFailed(error.message);
}
