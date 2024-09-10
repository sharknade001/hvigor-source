"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.setRunning=exports.addModuleDependency=exports.addConfigDeps=void 0;const chokidar_1=__importDefault(require("chokidar")),cluster_1=__importDefault(require("cluster")),path_1=__importDefault(require("path")),path_const_js_1=require("../../../common/const/path-const.js"),system_util_js_1=require("../../../common/util/system-util.js"),event_id_options_js_1=require("../../internal/lifecycle/event/event-id-options.js"),hvigor_process_js_1=require("../../internal/lifecycle/hvigor-process.js"),hvigor_daemon_log_js_1=require("../log/hvigor-daemon-log.js"),wrapper_const_1=require("../../../cli/wrapper/wrapper-const"),const_1=require("../../../common/const/const"),hvigor_config_reader_1=require("../../util/hvigor-config-reader"),_log=hvigor_daemon_log_js_1.HvigorDaemonLogger.getLogger("daemon");let watcher,isRunning=!1;const hvigorFiles=[];let hvigorConfigWatcher;function addConfigDeps(){const e=getModuleDependencies(hvigorFiles).filter((e=>{const o=path_1.default.relative(path_const_js_1.HVIGOR_USER_HOME,e);return!(o&&!o.startsWith("..")&&!path_1.default.isAbsolute(o)&&e.includes("node_modules"))}));cluster_1.default.isWorker&&watcher.add(e)}function addModuleDependency(e){hvigorFiles.includes(e)||hvigorFiles.push(e)}function setRunning(e){isRunning=e}function getModuleDependencies(e){const o=e.map((e=>require.resolve(e)));return e.forEach((e=>{const r=require.resolve(e),t=require.cache[r];void 0!==t&&function e(r){r.children.forEach((r=>{o.includes(r.filename)||(o.push(r.filename),e(r))}))}(t)})),o}cluster_1.default.isWorker&&(watcher=chokidar_1.default.watch([],{usePolling:(0,system_util_js_1.isWindows)(),interval:250}),watcher.on("change",(e=>{const o=()=>{_log.debug(`worker ${cluster_1.default.worker.id} detected hvigorfile's dependency changed. Path ${e} changed. Will exit and start another worker process.`),cluster_1.default.worker.isConnected()&&(_log.debug("worker isConnected start disconnect"),cluster_1.default.worker.disconnect(),cluster_1.default.worker.kill())};isRunning?(hvigor_process_js_1.hvigorProcess.once(event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FINISHED,o),hvigor_process_js_1.hvigorProcess.once(event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FAILED,o)):o()})),hvigorConfigWatcher=chokidar_1.default.watch([path_1.default.resolve(wrapper_const_1.HVIGOR_PROJECT_WRAPPER_HOME,const_1.DEFAULT_HVIGOR_CONFIG_JSON_FILE_NAME)],{usePolling:(0,system_util_js_1.isWindows)(),interval:250}),hvigorConfigWatcher.on("change",(e=>{var o,r,t,i;const n=process.execArgv,s=n.findIndex((e=>e.startsWith("--max-old-space-size=")));let d;-1!==s&&Number(n[s].split("=")[1])&&(d=Number(n[s].split("=")[1]));const c=n.findIndex((e=>e.startsWith("--expose-gc"))),_=d!==(null===(r=null===(o=hvigor_config_reader_1.HvigorConfigReader.getHvigorConfig())||void 0===o?void 0:o.nodeOptions)||void 0===r?void 0:r.maxOldSpaceSize),l=null===(i=null===(t=hvigor_config_reader_1.HvigorConfigReader.getHvigorConfig())||void 0===t?void 0:t.nodeOptions)||void 0===i?void 0:i.exposeGC;(_||(-1===c&&!1!==l||-1!==c&&!1===l))&&(_log.debug(`Worker ${cluster_1.default.worker.id} detected changes in 'hvigor-config.json5' nodeOptions.maxOldSpaceSize or exposeGC. Path ${e} changed. Will exit and start another worker process.`),cluster_1.default.worker.isConnected()&&(_log.debug("worker isConnected start disconnect"),cluster_1.default.worker.disconnect(),cluster_1.default.worker.kill()))}))),exports.addConfigDeps=addConfigDeps,exports.addModuleDependency=addModuleDependency,exports.setRunning=setRunning;