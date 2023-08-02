/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 389:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(389);
const { exec, spawnSync } = __nccwpck_require__(81);
const path = __nccwpck_require__(17);
const fb_env = {
  'FIREBOLT_CLIENT_ID': core.getInput('firebolt-client-id'),
  'FIREBOLT_CLIENT_SECRET': core.getInput('firebolt-client-secret'),
  'FIREBOLT_SERVER': core.getInput('api-endpoint'),
  'FIREBOLT_ACCOUNT': core.getInput('account'),
  'FIREBOLT_ENGINE_SPEC': core.getInput('instance-type'),
  'FIREBOLT_ENGINE_SCALE': core.getInput('engine-scale')
}


const action_workdir = path.join(__dirname, "../../")

core.info("Action workdir: " + action_workdir)


function resolve_local_file(file_path) {
  return path.join(action_workdir, file_path)
}

function setup_virtualenv(on_success, on_error) {
  exec('rm -r' + resolve_local_file('.venv') + ' || true && python -m pip install virtualenv && python -m virtualenv ' + resolve_local_file('.venv'),
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
  // TODO: Set firebolt-sdk version as soon as new idenitity is released
  exec(path.join(python_dir, "pip") + " install git+https://github.com/firebolt-db/firebolt-python-sdk.git retry",
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
  return result.status == 0 ? on_success(result.stdout.toString().trim('\n'), python_dir) : on_error(result.stderr.toString());
}

function start_engine(db_name, python_dir, on_success, on_error) {
  const result = spawnSync(path.join(python_dir, 'python'),
    [resolve_local_file('scripts/start_engine.py'), db_name],
    { env: fb_env }
  );
  if (result.status != 0) {
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

})();

module.exports = __webpack_exports__;
/******/ })()
;