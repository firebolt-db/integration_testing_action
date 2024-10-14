const core = require('@actions/core');
const { exec, spawnSync } = require("child_process");
const path = require('path');
const fb_env = {
  'FIREBOLT_USER': core.getInput('firebolt-username'),
  'FIREBOLT_PASSWORD': core.getInput('firebolt-password'),
  'FIREBOLT_SERVER': core.getInput('api-endpoint'),
  'FIREBOLT_DEFAULT_REGION': core.getInput('region'),
  'FIREBOLT_ENGINE_SPEC': core.getInput('instance-type'),
  'FIREBOLT_ENGINE_SCALE': core.getInput('engine-scale')
}

const action_workdir = path.join(__dirname, "../../")

core.info("Action workdir: " + action_workdir)


function resolve_local_file(file_path) {
  return path.join(action_workdir, file_path)
}

function setup_virtualenv(on_success, on_error) {
  exec('rm -r ' + resolve_local_file('.venv') + ' || true && python -m venv ' + resolve_local_file('.venv'),
    function (error, stdout, stderr) {
      if (error != null) {
        return on_error(error.message)
      }
      const python_dir = path.join(resolve_local_file('.venv'), process.platform == 'win32' ? '/Scripts' : '/bin/');
      return on_success(python_dir)
    }
  )
}

function install_python_dependencies(python_dir, on_success, on_error) {
  exec(path.join(python_dir, "pip") + ' install "firebolt-sdk>=0.16.0,<1.0.0" pydantic==1.10.10 retry',
    function (error, stdout, stderr) {
      error == null ? on_success(python_dir) : on_error(error.message);
    }
  )
}

function start_db(python_dir, on_success, on_error) {
  const result = spawnSync(path.join(python_dir, 'python'),
    [resolve_local_file('scripts/start_database.py'), core.getInput('db_suffix')],
    { env: fb_env }
  );
  return result.stderr.toString().length == 0 ? on_success(result.stdout.toString().trim('\n'), python_dir) : on_error(result.stderr.toString());
}

function start_engine(db_name, python_dir, on_success, on_error) {
  const result = spawnSync(path.join(python_dir, 'python'),
    [resolve_local_file('scripts/start_engine.py'), db_name],
    { env: fb_env }
  );
  if (result.stderr.toString().length != 0) {
    return on_error(result.stderr.toString());
  }
  const values = result.stdout.toString().split(' ');
  const engine_name = values[0].trim('\n');
  const engine_url = values[1].trim('\n');
  const stopped_engine_name = values[2].trim('\n');
  const stopped_engine_url = values[3].trim('\n');
  return on_success(engine_name, engine_url, stopped_engine_name, stopped_engine_url);
}

try {
  setup_virtualenv(pp => {
    core.saveState('python_path', pp);
    install_python_dependencies(pp,
      pp => start_db(pp,
        (db_name, pp) => {
          core.setOutput('database_name', db_name);
          core.saveState('database_name', db_name);
          start_engine(
            db_name, pp,
            (en, eu, sen, seu) => {
              core.setOutput('engine_name', en);
              core.saveState('engine_name', en);
              core.setOutput('engine_url', eu);

              core.setOutput('stopped_engine_name', sen);
              core.saveState('stopped_engine_name', sen);
              core.setOutput('stopped_engine_url', seu);
            },
            err_msg => core.setFailed(err_msg)
          )
        },
        err_msg => core.setFailed(err_msg)
      ),
      err_msg => core.setFailed(err_msg)
    ), err_msg => core.setFailed(err_msg)
  })

} catch (error) {
  core.setFailed(error.message);
}
