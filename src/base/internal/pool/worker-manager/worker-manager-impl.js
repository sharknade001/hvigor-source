"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.WorkerManagerImpl=void 0;const path_1=__importDefault(require("path")),worker_threads_1=require("worker_threads"),index_js_1=require("../../../../common/util/iconv/index.js"),noop_js_1=require("../../../../common/util/noop.js"),hvigor_daemon_log_js_1=require("../../../daemon/log/hvigor-daemon-log.js"),time_util_1=require("../../../util/time-util"),constant_js_1=require("../constant/constant.js"),log_type_js_1=require("../enum/log-type.js"),task_state_js_1=require("../enum/task-state.js"),worker_state_js_1=require("../enum/worker-state.js"),tcb_store_js_1=require("../store/tcb-store.js"),worker_js_1=require("./worker.js");class WorkerManagerImpl{constructor(e,t,r){this.errorCallback=noop_js_1.noop,this._log=hvigor_daemon_log_js_1.HvigorDaemonLogger.getLogger(WorkerManagerImpl.name),this.maxPoolNum=Math.floor(e.maxPoolNum&&e.maxPoolNum>=1?e.maxPoolNum:constant_js_1.PoolConstant.MAX_POOL_NUM),this.minPoolNum=Math.floor(e.minPoolNum&&e.minPoolNum>=0?Math.max(e.minPoolNum,constant_js_1.PoolConstant.MIN_POOL_NUM):constant_js_1.PoolConstant.MIN_POOL_NUM),this.minPoolNum=Math.min(this.minPoolNum,this.maxPoolNum),this.recycleInterval=Math.floor(e.recycleInterval&&e.recycleInterval>0?e.recycleInterval:constant_js_1.PoolConstant.DEFAULT_RECYCLE_INTERVAL),this.maxIdleTime=Math.floor(e.maxIdleTime&&e.maxIdleTime>0?e.maxIdleTime:constant_js_1.PoolConstant.DEFAULT_MAX_IDLE_TIME),this.idleWorkers=new Map,this.busyWorkers=new Map,this.deadWorkers=new Set,this.timer=setInterval((()=>this.recycle()),this.recycleInterval),this.callbacks=new Map,this.eventMap=new Map([[constant_js_1.PoolConstant.WORK_DONE,task_state_js_1.TaskState.END],[constant_js_1.PoolConstant.WORK_ERROR,task_state_js_1.TaskState.ERROR]]),this.dispatch=t,this.addLog=r,this.maxCoreSize=void 0!==e.maxCoreSize&&e.maxCoreSize>=0?e.maxCoreSize:void 0,this.maxCoreSize&&(this.maxCoreSize=Math.floor(this.maxCoreSize)),this.residentWorkers=new Set,this.cacheCapacity=e.cacheCapacity,this.cacheTtl=e.cacheTtl;for(let e=0;e<this.minPoolNum;e++)this.createWorker()}getMaxPoolNum(){return this.maxPoolNum}getMinPoolNum(){return this.minPoolNum}cleanUp(e){const t=t=>{t.forEach(((r,s)=>{this.residentWorkers.has(s)&&!this.busyWorkers.has(s)&&r.hasCache()?r.sendMessageToWorker({event:constant_js_1.PoolConstant.UNMOUNT_TSC_COMMON_CACHE_EVENT}):(this._log.debug(`Cleanup worker ${s}.`),t.delete(s),r.terminate((()=>{this._log.debug(`Worker ${s} has been cleaned up.`),this._log.debug(`Current idle worker size: ${this.idleWorkers.size}.`),this._log.debug(`Current resident worker size: ${this.residentWorkers.size}.`),this.idleWorkers.size===this.residentWorkers.size&&e()})))}))};this.busyWorkers.size+this.idleWorkers.size===0?(this._log.debug("There's no busy workers and idle workers need cleanup."),this.callbacks.clear(),e()):(t(this.busyWorkers),t(this.idleWorkers),this.callbacks.clear())}clear(e){clearInterval(this.timer),this.busyWorkers.size+this.idleWorkers.size===0?(this._log.debug("There's no busy workers and idle workers need to be cleared."),this.deadWorkers.clear(),this.residentWorkers.clear(),this.callbacks.clear(),e()):(this.clearWorkers(e,this.idleWorkers),this.clearWorkers(e,this.busyWorkers),this.callbacks.clear())}clearWorkers(e,t){t.forEach(((r,s)=>{this._log.debug(`Clear worker ${s}.`),t.delete(s),r.terminate((()=>{this._log.debug(`Worker ${s} has been cleared.`),this._log.debug(`Current idle worker size: ${this.idleWorkers.size}.`),this._log.debug(`Current busy worker size: ${this.busyWorkers.size}.`),this.idleWorkers.size||this.busyWorkers.size||(this.deadWorkers.clear(),this.residentWorkers.clear(),e())}))}))}createWorker(e,t=[]){if(this.isFull())return this._log.debug("Failed to create worker since the worker pool is full."),!1;const r=this.getAllocatedId(e);if(r<0)return this._log.debug("Failed to create worker since no worker id could be allocated."),!1;const s=void 0===this.maxCoreSize||this.residentWorkers.size<this.maxCoreSize;this._log.debug(`Create ${s?"":"non-"} resident worker with id: ${r}.`);const o=this._createWorker(t,s),i=new worker_js_1.HWorker(o,r);return this.idleWorkers.set(i.getId(),i),s&&this.residentWorkers.add(r),this.listenWorkerEvents(o,i,r),o.stdout.on("data",this.getDataHandler(i)(process.stdout)),o.stderr.on("data",this.getDataHandler(i)(process.stderr)),!0}listenWorkerEvents(e,t,r){this.listenExitEvent(e,t,r),this.listenErrorEvent(e,t,r),this.listenMessageEvent(e,t,r)}listenExitEvent(e,t,r){e.on("exit",(e=>{this.idleWorkers.delete(r),this.busyWorkers.delete(r),this.deadWorkers.add(r),this.residentWorkers.delete(r),this._log.debug(`worker[${r}] exits with exit code ${e}.`),this.dispatch(this,t.getId())}))}listenErrorEvent(e,t,r){e.on("error",(e=>{e.dece&&this.errorCallback(e.dece),this._log.debug(`worker[${r}] encounters error: ${e.message}.`);const s=this.onWorkError(t);this.notifyError(s,constant_js_1.PoolConstant.WORK_ERROR,e)}))}listenMessageEvent(e,t,r){e.on("message",(async e=>{var s;if(t.updateCacheSize(null!==(s=e.cacheSize)&&void 0!==s?s:0),e.event===constant_js_1.PoolConstant.WORK_ERROR){this._log.debug(`worker[${r}] has one work error.`);const s=this.onWorkError(t),o=e.returnVal,i=new Error(o.message);o.stack&&(i.stack=o.stack),this.notifyError(s,constant_js_1.PoolConstant.WORK_ERROR,i)}else{this._log.debug(`worker[${r}] has one work done.`);const s=tcb_store_js_1.TcbStore.getTCB(e.id);if(this.callbacks.has(e.id)&&e.event===constant_js_1.PoolConstant.WORK_DONE){const r=this.callbacks.get(e.id);try{await(null==r?void 0:r.fn(...(null==s?void 0:s.useReturnVal())?[e.returnVal]:r.input))}catch(e){this.notifyError(this.onWorkError(t),constant_js_1.PoolConstant.CALLBACK_ERROR,e)}}t.setLastBusyTime(Date.now()),t.cancelCurWorkId(),null==s||s.setEndTime(Number(process.hrtime.bigint())),null==s||s.setState(this.eventMap.get(e.event)),this.busyWorkers.delete(t.getId()),t.setState(worker_state_js_1.WorkerState.IDLE),this.idleWorkers.set(t.getId(),t),this.notify(e.id,e.event),this.dispatch(this,t.getId())}}))}onWorkError(e){var t,r;const s=e.getCurWorkId();return e.setLastBusyTime(Date.now()),e.cancelCurWorkId(),null===(t=tcb_store_js_1.TcbStore.getTCB(s))||void 0===t||t.setEndTime(Number(process.hrtime.bigint())),null===(r=tcb_store_js_1.TcbStore.getTCB(s))||void 0===r||r.setState(this.eventMap.get(constant_js_1.PoolConstant.WORK_ERROR)),this.busyWorkers.delete(e.getId()),e.setState(worker_state_js_1.WorkerState.IDLE),this.idleWorkers.set(e.getId(),e),s}_createWorker(e=[],t){return new worker_threads_1.Worker(path_1.default.resolve(__dirname,constant_js_1.PoolConstant.WORKER_ACTION_PATH),{workerData:{logLevel:this._log.getLevel().levelStr,preludeDeps:e,shouldResident:t,cacheCapacity:this.cacheCapacity,cacheTtl:this.cacheTtl},env:process.env,stdout:!0,stderr:!0})}getAllocatedId(e){let t=-1;if(void 0!==e&&(this.isBusyWorker(e)||this.isIdleWorker(e)))return t;if(void 0!==e)t=e,this.isRecycledWorker(e)&&this.deadWorkers.delete(t);else if(this.deadWorkers.size)t=this.deadWorkers.values().next().value,this.deadWorkers.delete(t);else for(let e=0;e<this.maxPoolNum;e++)if(!this.isBusyWorker(e)&&!this.isIdleWorker(e)){t=e;break}return t}notify(e,t){const r=tcb_store_js_1.TcbStore.getTCB(e);r&&!r.isWarmUp()&&r.emit(t,e)}notifyError(e,t,r){const s=tcb_store_js_1.TcbStore.getTCB(e);s&&!s.isWarmUp()&&s.emit(t,{id:e,error:r})}getDataHandler(e){return t=>r=>{var s,o,i;if(!e.getCurWorkId())return void t.write(r);const a=index_js_1.iconv.decode(r,constant_js_1.PoolConstant.ENCODING),n={type:log_type_js_1.LogType.WORK,time:(0,time_util_1.isHvigorLogWithTime)(a)?a.substring(0,constant_js_1.PoolConstant.TIME_PREFIX_LENGTH):constant_js_1.PoolConstant.UNKNOWN_LOG_TIME,workerId:e.getId(),content:a,taskPath:null===(s=tcb_store_js_1.TcbStore.getTCB(e.getCurWorkId()))||void 0===s?void 0:s.getTaskPath(),taskName:null===(o=tcb_store_js_1.TcbStore.getTCB(e.getCurWorkId()))||void 0===o?void 0:o.getTaskName(),taskCompletePath:null===(i=tcb_store_js_1.TcbStore.getTCB(e.getCurWorkId()))||void 0===i?void 0:i.getTaskCompletePath()};this.addLog(n),t.write(r)}}doWork(e,t,r,s){if(!this.idleWorkers.has(s))return!1;const o=this.idleWorkers.get(s);return!(o.isMeltdown()||!this.idleWorkers.get(s).doWork(e))&&(this.idleWorkers.delete(s),this.busyWorkers.set(s,o),e.hasSideEffects()&&o.meltdown(),tcb_store_js_1.TcbStore.getTCB(e.getId()).setState(task_state_js_1.TaskState.RUNNING),tcb_store_js_1.TcbStore.getTCB(e.getId()).setStartTime(Number(process.hrtime.bigint())),tcb_store_js_1.TcbStore.getTCB(e.getId()).setWorkerId(s),this.callbacks.set(e.getId(),{fn:t,input:r}),!0)}getAvailableWorkers(){return Array.from(this.idleWorkers.keys())}hasAvailableWorkers(){return this.idleWorkers.size>0}recycle(){this.idleWorkers.forEach(((e,t)=>{this.idleWorkers.size+this.busyWorkers.size>this.minPoolNum&&Date.now()-e.getLastBusyTime()>this.maxIdleTime&&!this.residentWorkers.has(t)&&(this.idleWorkers.delete(t),this.deadWorkers.add(t),e.terminate(noop_js_1.noop))}))}setMaxIdleTime(e){e>0&&(this.maxIdleTime=e)}setRecycleInterval(e){e>0&&(this.recycleInterval=e,clearInterval(this.timer),this.timer=setInterval((()=>{this.recycle()}),this.recycleInterval))}setErrorCallback(e){this.errorCallback===noop_js_1.noop&&(this.errorCallback=e)}isBusyWorker(e){return this.busyWorkers.has(e)}isIdleWorker(e){return this.idleWorkers.has(e)}isRecycledWorker(e){return this.deadWorkers.has(e)}isFull(){return this.idleWorkers.size+this.busyWorkers.size>=this.maxPoolNum}}exports.WorkerManagerImpl=WorkerManagerImpl;