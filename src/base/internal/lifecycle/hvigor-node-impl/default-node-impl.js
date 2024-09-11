"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.DefaultNodeImpl = void 0);
const path_1 = __importDefault(require("path")),
  hook_const_js_1 = require("../../../../common/const/hook-const.js"),
  noop_js_1 = require("../../../../common/util/noop.js"),
  queue_js_1 = require("../../../../common/util/queue.js"),
  class_type_const_js_1 = require("../../../common/options/class-type-const.js"),
  common_const_js_1 = require("../../../common/options/common-const.js"),
  hvigor_trace_js_1 = require("../../../common/trace/hvigor-trace.js"),
  hvigor_core_js_1 = require("../../../external/core/hvigor-core.js"),
  default_plugin_container_js_1 = require("../../../external/plugin/default-plugin-container.js"),
  hvigor_log_js_1 = require("../../../log/hvigor-log.js"),
  loader_profile_js_1 = require("../../../vigor/plugin/interface/loader-profile.js"),
  plugin_context_js_1 = require("../../../vigor/plugin/interface/plugin-context.js"),
  transform_hvigor_task_js_1 = require("../../../vigor/task/impl/transform-hvigor-task.js"),
  default_internal_task_js_1 = require("../../task/core/default-internal-task.js"),
  lazy_task_container_js_1 = require("../../task/core/lazy-task-container.js"),
  task_directed_acyclic_graph_js_1 = require("../../task/core/task-directed-acyclic-graph.js"),
  task_path_util_js_1 = require("../../task/util/task-path-util.js");
class DefaultNodeImpl {
  constructor(e, t) {
    (this.classKind = class_type_const_js_1.ClassTypeConst.HVIGOR_NODE),
      (this.taskMap = new Map()),
      (this.extraOption = new Map()),
      (this.logger = hvigor_log_js_1.HvigorLogger.getLogger(
        DefaultNodeImpl.name
      )),
      (this.beforeNodeEvaluateFnQueue = new queue_js_1.Queue()),
      (this.afterNodeEvaluateFnQueue = new queue_js_1.Queue()),
      (this.afterBindSystemPluginsFnQueue = new queue_js_1.Queue()),
      (this._nodeName = e),
      (this._nodePath = t),
      (this._packageJsonPath = path_1.default.resolve(
        t,
        common_const_js_1.HvigorCommonConst.PACKAGE_JSON
      )),
      (this._buildFilePath = path_1.default.resolve(
        t,
        common_const_js_1.HvigorCommonConst.BUILD_FILE_NAME
      )),
      (this._buildProfilePath = path_1.default.resolve(
        t,
        common_const_js_1.HvigorCommonConst.BUILD_PROFILE_FILE
      )),
      (this._taskGraph =
        new task_directed_acyclic_graph_js_1.TaskDirectedAcyclicGraph()),
      (this._tasks = new lazy_task_container_js_1.LazyTaskContainer(e)),
      (this._pluginContainer =
        new default_plugin_container_js_1.DefaultPluginContainer()),
      (this._currentNodeLoaderPluginIds = []),
      (this._contextInfo = new plugin_context_js_1.PluginContext());
  }
  getTaskPaths() {
    const e =
      this.classKind === class_type_const_js_1.ClassTypeConst.HVIGOR_PROJECT
        ? ""
        : this._nodeName;
    return this._tasks
      .getTaskPaths()
      .map((t) => (0, task_path_util_js_1.union)(e, t));
  }
  getTaskDepends(e) {
    return this._tasks.getTaskDepends(e);
  }
  getBuildProfilePath() {
    return this._buildProfilePath;
  }
  getBuildFilePath() {
    return this._buildFilePath;
  }
  getNodeDir() {
    return this._nodePath;
  }
  getName() {
    return this._nodeName;
  }
  getPackageJsonPath() {
    return this._packageJsonPath;
  }
  // sharknade note : 绑定插件。 万物皆node
  bindPlugin(e) {
    return this._pluginContainer.registryPlugin(e);
  }
  bindPluginContextFunc(e, t) {
    this._contextInfo.setContextFunc(e, t),
      this._currentNodeLoaderPluginIds.push(e);
  }
  getPluginById(e) {
    return this._pluginContainer.getPluginById(e);
  }
  getContext(e) {
    return this._contextInfo.getContext(e);
  }
  getAllPluginIds() {
    return this._currentNodeLoaderPluginIds;
  }
  getAllTasks() {
    return this._tasks.getAllTasks();
  }
  getTaskByName(e) {
    return this._tasks.findTask(e);
  }
  task(e, t) {
    let s;
    s = void 0 === t || "string" == typeof t ? { name: t || "default" } : t;
    const o = e || noop_js_1.noop,
      i = new default_internal_task_js_1.DefaultInternalTask(this, s, o);
    return this._tasks.addTask(i), i;
  }
  registry(e) {
    return this._tasks.addTask(e), e;
  }
  registerTask(e) {
    (0, hvigor_trace_js_1.addCustomTask)({ NAME: e.name });
    const t = new transform_hvigor_task_js_1.TransformHvigorTask(this, e);
    return (
      t.initTaskContext(),
      t.initDependency(),
      t.initTaskRun(),
      this._tasks.addTask(t),
      e
    );
  }
  getTaskContext() {
    return { moduleName: this.getName(), modulePath: this.getNodeDir() };
  }
  hasTask(e) {
    return this._tasks.hasTask(e);
  }
  registryDependsOnTask(e, ...t) {
    this.taskMap.set(e, t),
      t.forEach((t) => {
        e.dependsOn(t);
      });
  }
  getTaskContainer() {
    return this._tasks;
  }
  getTaskGraph() {
    return this._taskGraph;
  }
  clearTaskGraph() {
    this._taskGraph.clear();
  }
  loadConfig(e) {
    this.configOpt = e;
  }
  getConfigOpt() {
    return new loader_profile_js_1.CoreConfig(this.configOpt);
  }
  addExtraOption(e, t) {
    this.extraOption.set(e, t);
  }
  getExtraOption(e) {
    return this.extraOption.get(e);
  }
  beforeNodeEvaluate(e) {
    this.beforeNodeEvaluateFnQueue.push(e);
  }
  afterNodeEvaluate(e) {
    this.afterNodeEvaluateFnQueue.push(e);
  }
  async executeNodeHook(e) {
    let t;
    if (e === hook_const_js_1.HookType.beforeNodeEvaluate)
      t = this.beforeNodeEvaluateFnQueue;
    else {
      if (e !== hook_const_js_1.HookType.afterNodeEvaluate)
        return void this.logger.errorMessageExit(
          "node Hook must be beforeNodeEvaluate or afterNodeEvaluate"
        );
      t = this.afterNodeEvaluateFnQueue;
    }
    for (; t.size() > 0; ) {
      const e = t.pop(),
        s = hvigor_core_js_1.hvigorCore.getHvigorNodeByScriptPath(
          this._buildFilePath
        );
      if (void 0 === s)
        return void this.logger.errorMessageExit(
          `cannot found Node: ${this._buildFilePath}`
        );
      e && (await e.bind(this)(s));
    }
  }
  afterBindSystemPlugins(e) {
    this.afterBindSystemPluginsFnQueue.push(e);
  }
  async executeAfterBindSystemPluginsHook() {
    for (; this.afterBindSystemPluginsFnQueue.size() > 0; ) {
      const e = this.afterBindSystemPluginsFnQueue.pop(),
        t = hvigor_core_js_1.hvigorCore.getHvigorNodeByScriptPath(
          this._buildFilePath
        );
      if (void 0 === t)
        return void this.logger.errorMessageExit(
          `cannot found Node: ${this._buildFilePath}`
        );
      e && (await e.bind(this)(t));
    }
  }
}
exports.DefaultNodeImpl = DefaultNodeImpl;
