"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.buildTaskGraph=void 0;const hvigor_log_js_1=require("../../log/hvigor-log.js"),task_directed_acyclic_graph_js_1=require("../task/core/task-directed-acyclic-graph.js"),task_path_util_js_1=require("../task/util/task-path-util.js"),_log=hvigor_log_js_1.HvigorLogger.getLogger("hvigor-build-task-graph"),taskPathCache=new Map;function buildTaskGraph(e){e.getSubModules().forEach((e=>buildGraph(e,e.getTaskPaths(),e.getTaskGraph()))),buildGraph(e,e.getTaskPaths(),e.getTaskGraph())}function buildGraph(e,a,t){const s=e.getProject().getSubModules();a.forEach((a=>{const{moduleName:r,taskName:o}=parseTaskPathWithCache(a);if(void 0!==(""===r?e.getProject():s.get(r)))for(const r of e.getTaskDepends(o)){const{moduleName:o,taskName:i}=parseTaskPathWithCache(r),h=""===o?e.getProject():s.get(o);if(void 0===h)return void _log.errorMessageExit(`Cannot find hvigor node '${o}' with task '${i}'.`);h.hasTask(i)||_log.errorMessageExit(`Cannot find hvigor task ${i} in module ${o} required by ${a}`),t.addEdge(a,r),task_directed_acyclic_graph_js_1.projectTaskDag.addEdge(a,r)}else _log.errorMessageExit(`Cannot find hvigor node '${r}' with task '${a}'.`)}));const{hasCircle:r,circlePath:o}=t.checkCircle();if(r){const e=`Circular dependency between the following tasks: ${o.join(" -> ")}`;_log.errorMessageExit(e)}}exports.buildTaskGraph=buildTaskGraph;const parseTaskPathWithCache=e=>{let a=taskPathCache.get(e);return void 0!==a||(a=(0,task_path_util_js_1.parseTaskPath)(e),taskPathCache.set(e,a)),a};