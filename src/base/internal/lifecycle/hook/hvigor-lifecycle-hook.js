"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.HvigorLifecycleHook = void 0);
const hook_const_js_1 = require("../../../../common/const/hook-const.js"),
  hvigor_core_js_1 = require("../../../external/core/hvigor-core.js"),
  hvigor_log_js_1 = require("../../../log/hvigor-log.js"),
  _log = hvigor_log_js_1.HvigorLogger.getLogger("HvigorLifecycleHook");
class HvigorLifecycleHook {
  constructor() {
    (this.configEvaluatedFnList = []),
      (this.nodesInitializedFnList = []),
      (this.beforeNodeEvaluateFnList = []),
      (this.afterNodeEvaluateFnList = []),
      (this.nodesEvaluatedFnList = []),
      (this.taskGraphResolvedFnList = []),
      (this.buildFinishedFnList = []),
      (this.strategies = {
        [hook_const_js_1.HookType.configEvaluated]: async (i) => {
          await this.runFn(this.configEvaluatedFnList, i);
        },
        [hook_const_js_1.HookType.nodesInitialized]: async (i) => {
          await this.runFn(this.nodesInitializedFnList, i);
        },
        [hook_const_js_1.HookType.beforeNodeEvaluate]: async (i) => {
          await this.runFn(this.beforeNodeEvaluateFnList, i);
        },
        [hook_const_js_1.HookType.afterNodeEvaluate]: async (i) => {
          await this.runFn(this.afterNodeEvaluateFnList, i);
        },
        [hook_const_js_1.HookType.nodesEvaluated]: async (i) => {
          await this.runFn(this.nodesEvaluatedFnList, i);
        },
        [hook_const_js_1.HookType.taskGraphResolved]: async (i) => {
          await this.runFn(this.taskGraphResolvedFnList, i);
        },
        [hook_const_js_1.HookType.buildFinished]: async (i) => {
          await this.runFn(this.buildFinishedFnList, i);
        },
      });
  }
  static getInstance() {
    return (
      HvigorLifecycleHook.instance ||
        (HvigorLifecycleHook.instance = new HvigorLifecycleHook()),
      HvigorLifecycleHook.instance
    );
  }
  async runFn(i, s) {
    for (const t of i) t && (await t.bind(this)(s));
  }
  async runHook(i, s) {
    try {
      await this.strategies[i].bind(this)(s);
    } catch (i) {
      i instanceof Error && _log.errorExit(i);
    }
  }
  configEvaluated(i) {
    this.configEvaluatedFnList.push(i);
  }
  nodesInitialized(i) {
    this.nodesInitializedFnList.push(i);
  }
  beforeNodeEvaluate(i) {
    this.beforeNodeEvaluateFnList.push(i);
  }
  afterNodeEvaluate(i) {
    this.afterNodeEvaluateFnList.push(i);
  }
  nodesEvaluated(i) {
    this.nodesEvaluatedFnList.push(i);
  }
  taskGraphResolved(i) {
    this.taskGraphResolvedFnList.push(i);
  }
  buildFinished(i) {
    this.buildFinishedFnList.push(i);
  }
  clear() {
    (this.configEvaluatedFnList = []),
      (this.nodesInitializedFnList = []),
      (this.beforeNodeEvaluateFnList = []),
      (this.afterNodeEvaluateFnList = []),
      (this.nodesEvaluatedFnList = []),
      (this.taskGraphResolvedFnList = []),
      (this.buildFinishedFnList = []),
      hvigor_core_js_1.hvigorCore.clearHvigorInternalHookList();
  }
}
exports.HvigorLifecycleHook = HvigorLifecycleHook;
