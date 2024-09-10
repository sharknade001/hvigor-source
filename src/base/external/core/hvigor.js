"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.hvigor = exports.Hvigor = void 0);
const parameters_js_1 = require("../../data/parameters.js"),
  hvigor_lifecycle_hook_js_1 = require("../../internal/lifecycle/hook/hvigor-lifecycle-hook.js"),
  hvigor_log_js_1 = require("../../log/hvigor-log.js"),
  hvigor_config_js_1 = require("./hvigor-config.js"),
  hvigor_core_js_1 = require("./hvigor-core.js"),
  _log = hvigor_log_js_1.HvigorLogger.getLogger("hvigor");
class Hvigor {
  constructor() {
    this.hvigorLifecycleHook =
      hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance();
  }
  getRootNode() {
    var o;
    const e =
      null === (o = hvigor_core_js_1.hvigorCore.getProject()) || void 0 === o
        ? void 0
        : o.getBuildFilePath();
    if (void 0 === e)
      throw (
        (_log.errorMessageExit("The root node is not yet available for build."),
        new Error("The root node is not yet available for build."))
      );
    const r = hvigor_core_js_1.hvigorCore.getHvigorNodeByScriptPath(e);
    if (void 0 === r)
      throw (
        (_log.errorMessageExit("The root node is not yet available for build."),
        new Error("The root node is not yet available for build."))
      );
    return r;
  }
  getAllNodes() {
    var o;
    const e = this.getRootNode(),
      r =
        null === (o = hvigor_core_js_1.hvigorCore.getProject()) || void 0 === o
          ? void 0
          : o.getBuildFilePath();
    if (void 0 === r) throw new Error("rootNode not found");
    const i = hvigor_core_js_1.hvigorCore.getSubNodeByScriptPath(r);
    return void 0 === i ? [e] : (i.push(e), i);
  }
  getNodeByName(o) {
    return this.getAllNodes().find((e) => e.getNodeName() === o);
  }
  getHvigorConfig() {
    return (
      hvigor_config_js_1.hvigorConfig ||
        _log.errorMessageExit(
          "The hvigorConfig is not yet available for build."
        ),
      hvigor_config_js_1.hvigorConfig
    );
  }
  getParameter() {
    return new parameters_js_1.ExternalParameter();
  }
  beforeNodeEvaluate(o) {
    this.hvigorLifecycleHook.beforeNodeEvaluate(o);
  }
  afterNodeEvaluate(o) {
    this.hvigorLifecycleHook.afterNodeEvaluate(o);
  }
  configEvaluated(o) {
    this.hvigorLifecycleHook.configEvaluated(o);
  }
  nodesInitialized(o) {
    this.hvigorLifecycleHook.nodesInitialized(o);
  }
  nodesEvaluated(o) {
    this.hvigorLifecycleHook.nodesEvaluated(o);
  }
  taskGraphResolved(o) {
    this.hvigorLifecycleHook.taskGraphResolved(o);
  }
  buildFinished(o) {
    this.hvigorLifecycleHook.buildFinished(o);
  }
  getCommandEntryTask() {
    return hvigor_core_js_1.hvigorCore.getCommandEntryTasks();
  }
  isCommandEntryTask(o) {
    return hvigor_core_js_1.hvigorCore.isCommandEntryTask(o);
  }
  // 原来这里可以透传出来，哈哈
  getExtraConfig() {
    return hvigor_core_js_1.hvigorCore.getExtraConfig();
  }
  
  getProject() {
    return hvigor_core_js_1.hvigorCore.getProject();
  }
}
(exports.Hvigor = Hvigor), (exports.hvigor = new Hvigor());
