"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.defaultModelRegistry=void 0;const hvigor_log_js_1=require("../log/hvigor-log.js");class DefaultToolingModelBeanRegistry{constructor(){this._log=hvigor_log_js_1.HvigorLogger.getLogger("ToolingModelBeanRegistry"),this._modelMap=new Map}registry(e){const o=e.modelId;this._modelMap.has(o)&&this._log.error("Multiple models have registered."),this._modelMap.set(o,e)}getModelMap(){return this._modelMap}clear(){this._modelMap.clear()}}exports.defaultModelRegistry=new DefaultToolingModelBeanRegistry;