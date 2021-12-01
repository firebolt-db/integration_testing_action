const core = require('@actions/core');
const exec = require('child_process').exec;

function stop_all(db_name, on_success, on_error) {
    exec('python3 scripts/stop_all.py ' + db_name ,
	 function(error, stdout, stderr) {
	     error == null ? on_success(stdout) : on_error(error.message);
	 })();    
}

try {
    stop_all(
	core.getState('database_name'),
	() => {},
	errMsg => core.error(errMsg)
    )
    
} catch (error) {
	core.setFailed(error.message);
}
