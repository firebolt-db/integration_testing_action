const core = require('@actions/core');
const exec = require('child_process').exec;

function start_db(on_success, on_error) {
    exec('python3 scripts/start_database.py',
	 function(error, stdout, stderr) {
	     error == null ? on_success(stdout) : on_error(error.message);
	 })();    
}

function start_engine(db_name, on_success, on_error) {
    exec('python3 scripts/start_engine.py ' + db_name,
	 function(error, stdout, stderr) {
	     if (error != null) {
		 return on_error(error.message);
	     }
	     values = stdout.split(' ');
	     engine_name = values[0];
	     engine_url = values[1];
	     stopped_engine_name = values[2]
	     stopped_engine_url = values[3]
	     return on_success(engine_name, engine_url, stopped_engine_name, stopped_engine_url);
	 })();    
}

try {
    start_db(
	db_name => {
	    core.setOutput('database_name', db_name);
	    core.saveState('database_name', db_name);
	    start_engine(
		db_name,
		en, eu, sen, seu  => {
		    core.setOutput('engine_name', en);
		    core.saveState('engine_name', en);
		    core.setOutput('engine_url', eu);

		    core.setOutput('stopped_engine_name', sen);
		    core.saveState('stopped_engine_name', sen);		    
		    core.setOutput('stopped_engine_url', seu);
		}
		
	    )},
	err_msg => core.error(err_msg)
    )
    
} catch (error) {
	core.setFailed(error.message);
}
