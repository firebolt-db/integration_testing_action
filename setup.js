const core = require('@actions/core');
const github = require('@actions/github')
const { exec } = require("child_process");
const path = require('path');
const fb_env = {
	'FIREBOLT_USER': core.getInput('firebolt-username'),
	'FIREBOLT_PASSWORD': core.getInput('firebolt-password'),
	'FIREBOLT_SERVER': core.getInput('api-endpoint'),
	'FIREBOLT_DEFAULT_REGION': core.getInput('region')
}


function resolve_local_file(file_path) {
	action_path = process.env.GITHUB_ACTION_REPOSITORY;
	action_ref = process.env.GITHUB_ACTION_REF;
	return path.join("/home/runner/work/_actions/", action_path, action_ref, file_path);
}

function setup_virtualenv(on_success, on_error) {
	exec('python -m pip install virtualenv && python -m virtualenv ' + resolve_local_file('.venv'),
		function(error, stdout, stderr) {
			if (error != null) {
				return on_error(error.message)
			}
			python_dir = path.join(resolve_local_file('.venv'), '/bin/');
			on_success(python_dir)
		}
	)
}

function install_firebolt_sdk(python_dir, on_success, on_error) {
	exec(path.join(python_dir, "pip") + " install firebolt-sdk",
		function(error, stdout, stderr) {
			error == null ? on_success(python_dir) : on_error(error.message);
		}
	)
}

function start_db(python_dir, on_success, on_error) {
	exec(path.join(python_dir, 'python') + ' ' + resolve_local_file('scripts/start_database.py'),
		{ env: fb_env },
		function(error, stdout, stderr) {
			error == null ? on_success(stdout, python_dir) : on_error(error.message);
		});
}

function start_engine(db_name, python_dir, on_success, on_error) {
	exec(path.join(python_dir, 'python') + ' ' + resolve_local_file('scripts/start_engine.py') + ' ' + db_name,
		{ env: fb_env },
		function(error, stdout, stderr) {
			if (error != null) {
				return on_error(error.message);
			}
			values = stdout.split(' ');
			engine_name = values[0].trimRight('\n');
			engine_url = values[1].trimRight('\n');
			stopped_engine_name = values[2].trimRight('\n');
			stopped_engine_url = values[3].trimRight('\n');
			return on_success(engine_name, engine_url, stopped_engine_name, stopped_engine_url);
		});
}

try {
    setup_virtualenv(pp => {
	core.saveState('python_path', pp);
		install_firebolt_sdk(pp,
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
