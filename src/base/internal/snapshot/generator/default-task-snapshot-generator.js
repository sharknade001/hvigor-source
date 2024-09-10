"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.DefaultTaskSnapshotGenerator=void 0;const path_1=__importDefault(require("path")),incremental_exec_task_js_1=require("../../../external/task/incremental-exec-task.js"),json_reader_js_1=require("../../../util/json-reader.js"),default_task_snapshot_js_1=require("../core/default-task-snapshot.js"),task_built_in_js_1=require("../util/task-built-in.js");var Execution=task_built_in_js_1.TaskBuiltIn.Execution,snapshotSerializationReplacer=task_built_in_js_1.TaskBuiltIn.snapshotSerializationReplacer,snapshotSerializationReceiver=task_built_in_js_1.TaskBuiltIn.snapshotSerializationReceiver;class DefaultTaskSnapshotGenerator{snapshot(e){const t=new default_task_snapshot_js_1.DefaultTaskSnapshot(e);if(e instanceof incremental_exec_task_js_1.IncrementalExecTask){t.addInput(Execution.COMMAND,e.declareExecutionCommand()),t.addInput(Execution.TOOLCHAIN,e.declareExecutionTool());const a=e.declareExecutionEnv(),s=[];Array.from(a.keys()).sort().forEach((e=>s.push(`${e}:${a.get(e)}${path_1.default.delimiter}`))),t.addInput(Execution.ENV,s.join())}return t}loadSnapshotFromJson(e){const t=json_reader_js_1.JsonReader.parseJsonText(e,{},snapshotSerializationReceiver);return Object.setPrototypeOf(t,default_task_snapshot_js_1.DefaultTaskSnapshot.prototype),t}loadSnapshotCacheFromJson(e){const t=json_reader_js_1.JsonReader.parseJsonText(e,new Map,snapshotSerializationReceiver),a=new Map;for(const[e,s]of Object.entries(t))a.set(e,Object.setPrototypeOf(s,default_task_snapshot_js_1.DefaultTaskSnapshot.prototype));return a}serializeSnapshotCacheToJson(e){const t=Object.fromEntries(e.entries());return JSON.stringify(t,snapshotSerializationReplacer)}}exports.DefaultTaskSnapshotGenerator=DefaultTaskSnapshotGenerator;