"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.CoreConfig=void 0;const noop_js_1=require("../../../../common/util/noop.js"),observable_property_js_1=require("../../../../common/util/observable-property.js"),hvigor_log_js_1=require("../../../log/hvigor-log.js");class CoreConfig{constructor(o){this.logger=hvigor_log_js_1.HvigorLogger.getLogger(CoreConfig.name),this.config=o?(0,observable_property_js_1.observe)(o,noop_js_1.noop):(0,observable_property_js_1.observe)({},noop_js_1.noop)}getObject(o){return this.config?this.config[o]:void 0}setObject(o,e){Object.keys(this.config[o]).forEach((e=>delete this.config[o][e])),Object.keys(e).forEach((r=>{this.config[o][r]=(0,observable_property_js_1.observe)(e[r],noop_js_1.noop)}))}}exports.CoreConfig=CoreConfig;