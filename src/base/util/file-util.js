"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(e,t,i,r){void 0===r&&(r=i);var o=Object.getOwnPropertyDescriptor(t,i);o&&!("get"in o?!t.__esModule:o.writable||o.configurable)||(o={enumerable:!0,get:function(){return t[i]}}),Object.defineProperty(e,r,o)}:function(e,t,i,r){void 0===r&&(r=i),e[r]=t[i]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),__importStar=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var i in e)"default"!==i&&Object.prototype.hasOwnProperty.call(e,i)&&__createBinding(t,e,i);return __setModuleDefault(t,e),t};Object.defineProperty(exports,"__esModule",{value:!0}),exports.findRealHvigorFilePath=exports.exitIfNotExists=exports.writeFile=exports.readFile=void 0;const fs=__importStar(require("fs")),common_const_js_1=require("../common/options/common-const.js");function readFile(e){return new Promise((function(t,i){fs.readFile(e,((e,r)=>{e?i(e):t(r)}))}))}function writeFile(e,t){return new Promise((function(i,r){fs.writeFile(e,t,(e=>{e?r(e):i()}))}))}function exitIfNotExists(e,t,i,r){fs.existsSync(t)||e.errorMessageExit(`Path not found: '${t}'. Please check field: '${i}' in file: '${r}'.`)}function findRealHvigorFilePath(e,t){if(e){for(const t of common_const_js_1.HvigorCommonConst.BUILD_FILE_NAME_SUFFIX){const i=`${e}${t}`;if(fs.existsSync(i))return i}null==t||t.errorMessageExit(`Hvigorfile not found: ${e}.ts/js`)}}exports.readFile=readFile,exports.writeFile=writeFile,exports.exitIfNotExists=exitIfNotExists,exports.findRealHvigorFilePath=findRealHvigorFilePath;