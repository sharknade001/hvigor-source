"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.levelMap=exports.getLevel=exports.setCategoriesLevel=exports.updateConfiguration=exports.getConfiguration=exports.setConfiguration=exports.logFilePath=void 0;const log4js_1=require("log4js"),path_1=__importDefault(require("path")),path_util_1=require("../../common/util/path-util"),path_const_1=require("../../common/const/path-const"),const_1=require("../../common/const/const"),logFilePath=()=>{let e;try{e=path_util_1.PathUtil.getHvigorCacheDir()}catch{e=path_1.default.resolve(path_const_1.HVIGOR_PROJECT_ROOT_DIR,const_1.HVIGOR_USER_HOME_DIR_NAME)}return path_1.default.resolve(e,"./outputs/build-logs")};exports.logFilePath=logFilePath;let configuration={appenders:{debug:{type:"stdout",layout:{type:"pattern",pattern:"[%d] > hvigor %p %c %[%m%]"}},"debug-log-file":{type:"file",filename:path_1.default.resolve((0,exports.logFilePath)(),"build.log"),maxLogSize:2097152,backups:9,encoding:"utf-8",pattern:"yyyy-MM-dd",level:"debug"},info:{type:"stdout",layout:{type:"pattern",pattern:"[%d] > hvigor %[%m%]"}},"no-pattern-info":{type:"stdout",layout:{type:"pattern",pattern:"%m"}},wrong:{type:"stderr",layout:{type:"pattern",pattern:"[%d] > hvigor %[%p: %m%]"}},"just-debug":{type:"logLevelFilter",appender:"debug",level:"debug",maxLevel:"debug"},"just-info":{type:"logLevelFilter",appender:"info",level:"info",maxLevel:"info"},"just-wrong":{type:"logLevelFilter",appender:"wrong",level:"warn",maxLevel:"error"}},categories:{default:{appenders:["just-debug","just-info","just-wrong"],level:"debug"},"no-pattern-info":{appenders:["no-pattern-info"],level:"info"},"debug-file":{appenders:["debug-log-file"],level:"debug"}}};const setConfiguration=e=>{configuration=e};exports.setConfiguration=setConfiguration;const getConfiguration=()=>configuration;exports.getConfiguration=getConfiguration;const updateConfiguration=()=>{const e=configuration.appenders["debug-log-file"];return e&&"filename"in e&&(e.filename=path_1.default.resolve((0,exports.logFilePath)(),"build.log")),configuration};exports.updateConfiguration=updateConfiguration;let contextLevel=log4js_1.levels.DEBUG;const setCategoriesLevel=(e,t)=>{contextLevel=e;const o=configuration.categories;for(const l in o)(null==t?void 0:t.includes(l))||l.includes("file")||Object.prototype.hasOwnProperty.call(o,l)&&(o[l].level=e.levelStr)};exports.setCategoriesLevel=setCategoriesLevel;const getLevel=()=>contextLevel;exports.getLevel=getLevel,exports.levelMap=new Map([["ALL",log4js_1.levels.ALL],["MARK",log4js_1.levels.MARK],["TRACE",log4js_1.levels.TRACE],["DEBUG",log4js_1.levels.DEBUG],["INFO",log4js_1.levels.INFO],["WARN",log4js_1.levels.WARN],["ERROR",log4js_1.levels.ERROR],["FATAL",log4js_1.levels.FATAL],["OFF",log4js_1.levels.OFF],["all",log4js_1.levels.ALL],["mark",log4js_1.levels.MARK],["trace",log4js_1.levels.TRACE],["debug",log4js_1.levels.DEBUG],["info",log4js_1.levels.INFO],["warn",log4js_1.levels.WARN],["error",log4js_1.levels.ERROR],["fatal",log4js_1.levels.FATAL],["off",log4js_1.levels.OFF]]);