"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.PluginContext=void 0;const hvigor_log_js_1=require("../../../log/hvigor-log.js");class PluginContext{constructor(){this.logger=hvigor_log_js_1.HvigorLogger.getLogger(PluginContext.name),this.contextMap=new Map}setContextFunc(t,e){this.contextMap.set(t,e)}getContext(t){const e=this.contextMap.get(t);if(this.contextMap.has(t)&&"function"==typeof e)return e()}}exports.PluginContext=PluginContext;