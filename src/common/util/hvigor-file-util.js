"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(e,t,i,r){void 0===r&&(r=i);var s=Object.getOwnPropertyDescriptor(t,i);s&&!("get"in s?!t.__esModule:s.writable||s.configurable)||(s={enumerable:!0,get:function(){return t[i]}}),Object.defineProperty(e,r,s)}:function(e,t,i,r){void 0===r&&(r=i),e[r]=t[i]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),__importStar=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var i in e)"default"!==i&&Object.prototype.hasOwnProperty.call(e,i)&&__createBinding(t,e,i);return __setModuleDefault(t,e),t},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.FileUtil=exports.NormalizedFile=void 0;const fs_extra_1=__importDefault(require("fs-extra")),path=__importStar(require("path")),hvigor_log_1=require("../../base/log/hvigor-log");class NormalizedFile{constructor(e){this.logger=hvigor_log_1.HvigorLogger.getLogger(NormalizedFile.name),this.filePath=e,Object.freeze(this)}asFileList(){if(FileUtil.isDictionary(this)&&this.filePath){const e=getAllFilesRecursively(this.filePath),t=[this];return e.forEach((e=>{t.push(new NormalizedFile(e))})),t}return[this]}file(e){try{if(this.filePath&&FileUtil.exist(path.resolve(this.filePath,e)))return new NormalizedFile(path.resolve(this.filePath,e));throw new Error(`the path: ${FileUtil.pathResolve(this.filePath,e)} is not exist`)}catch(e){e instanceof Error&&dealErrorMessage(e,this.logger)}}getPath(){return this.filePath}}exports.NormalizedFile=NormalizedFile;class FileUtil{static exist(e){try{if("string"==typeof e)return fs_extra_1.default.existsSync(e);throw new Error("The parameter type is invalid. The function requires the string type.")}catch(e){e instanceof Error&&dealErrorMessage(e,this.logger)}return!1}static isDictionary(e){const t="string"==typeof e?e:e.filePath;try{if(FileUtil.exist(t))return fs_extra_1.default.statSync(t).isDirectory();throw new Error(`the Path: ${t} is not exist`)}catch(e){e instanceof Error&&dealErrorMessage(e,this.logger)}return!1}static isFile(e){const t="string"==typeof e?e:e.filePath;try{if(FileUtil.exist(t))return fs_extra_1.default.statSync(t).isFile();throw new Error(`the Path: ${t} is not exist`)}catch(e){e instanceof Error&&dealErrorMessage(e,this.logger)}return!1}static ensureDirSync(e){FileUtil.exist(e)||fs_extra_1.default.ensureDirSync(e)}static ensureFileSync(e){FileUtil.exist(e)||fs_extra_1.default.ensureFileSync(e)}static readFileSync(e){const t="string"==typeof e?e:e.filePath;return checkFile(t,this.logger),fs_extra_1.default.readFileSync(t)}static readFile(e){const t="string"==typeof e?e:e.filePath;return checkFile(t,this.logger),fs_extra_1.default.readFile(t)}static readJson5(e){const t="string"==typeof e?e:e.filePath;return checkFile(t,this.logger),JSON.parse(fs_extra_1.default.readFileSync(t,"utf8")),JSON.parse(fs_extra_1.default.readFileSync(t,"utf8"))}static writeFile(e,t){const i="string"==typeof e?e:e.filePath;return checkFile(i,this.logger),fs_extra_1.default.writeFile(i,t,"utf-8")}static writeFileSync(e,t){const i="string"==typeof e?e:e.filePath;checkFile(i,this.logger);try{fs_extra_1.default.writeFileSync(i,t,"utf-8")}catch(e){this.logger.errorMessageExit(`Failed to write File：${e}`)}}static copyFile(e,t){const i="string"==typeof e?e:e.filePath;return checkFile(i,this.logger),fs_extra_1.default.copyFile(i,t)}static copyFileSync(e,t){const i="string"==typeof e?e:e.filePath;checkFile(i,this.logger);try{fs_extra_1.default.copyFileSync(i,t)}catch(e){this.logger.errorMessageExit("Failed to write File：please check File Path")}}static pathResolve(...e){return path.resolve(...e)}}function getAllFilesRecursively(e){const t=[];return function e(i){const r=fs_extra_1.default.readdirSync(i);for(const s of r){const r=path.join(i,s);fs_extra_1.default.statSync(r).isDirectory()?(t.push(r),e(r)):t.push(r)}}(e),t}function checkFile(e,t){const i=FileUtil.isFile(e);try{if(!i)throw new Error(`the path: ${e} is not a file path`)}catch(e){e instanceof Error&&dealErrorMessage(e,t)}}function dealErrorMessage(e,t){if(e.stack){const i=e.stack.split("\n");for(const r of i)if(r.includes(" at")&&!r.includes("hvigor-file-util")){const i=r.substring(r.indexOf("(")+1,r.indexOf(")"));t.errorMessageExit(`${e.message}\nERROR: File: ${i}`)}}t.errorMessageExit(e.message)}exports.FileUtil=FileUtil,FileUtil.logger=hvigor_log_1.HvigorLogger.getLogger(FileUtil.name);