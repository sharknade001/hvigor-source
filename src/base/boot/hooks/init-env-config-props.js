"use strict";var __importDefault=this&&this.__importDefault||function(o){return o&&o.__esModule?o:{default:o}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.initEnvConfigProps=void 0;const fs_1=__importDefault(require("fs")),os_1=__importDefault(require("os")),path_1=__importDefault(require("path")),process_1=__importDefault(require("process")),common_const_js_1=require("../../common/options/common-const.js"),global_data_js_1=require("../../internal/data/global-data.js"),hvigor_log_js_1=require("../../log/hvigor-log.js"),configFileName=common_const_js_1.HvigorCommonConst.BUILD_PROFILE_FILE_NAME,propertiesAlias="prop",modeAlias="mode",_log=hvigor_log_js_1.HvigorLogger.getLogger("hvigor-InitEnvConfigProps");function initEnvConfigProps(){const o=global_data_js_1.globalData.cliOpts,t=global_data_js_1.globalData.cliEnv,e=path_1.default.resolve(process_1.default.cwd(),common_const_js_1.HvigorCommonConst.BUILD_PROFILE_FILE);fs_1.default.existsSync(e)||_log.errorMessageExit(`Cannot find project build file '${common_const_js_1.HvigorCommonConst.BUILD_PROFILE_FILE}'\n        ${os_1.default.EOL}\t at ${t.cwd}`);const s=new Map;void 0!==o.prop&&[o.prop].flat(2).forEach((o=>{const t=o.split("=");s.set(t[0],t[1])})),t.configProps=new Map([[configFileName,e],["prop",s],["mode",o.mode]])}exports.initEnvConfigProps=initEnvConfigProps;