const core = require('@actions/core');
const { exec } = require("child_process");
const path = require('path');


function resolve_local_file(file_path) {
    action_path = process.env.GITHUB_ACTION_REPOSITORY;
    action_ref = process.env.GITHUB_ACTION_REF;
    return path.join("/home/runner/work/_actions/", action_path, action_ref, file_path);
}

function stop_all(db_name, on_success, on_error) {
    exec('python3' + resolve_local_file('scripts/stop_all.py') + ' ' + db_name ,
	 function(error, stdout, stderr) {
	     error == null ? on_success(stdout) : on_error(error.message);
	 });    
}

try {
    stop_all(
	core.getState('database_name'),
	() => {},
	errMsg => core.setFailed(errMsg)
    )
    
} catch (error) {
	core.setFailed(error.message);
}
