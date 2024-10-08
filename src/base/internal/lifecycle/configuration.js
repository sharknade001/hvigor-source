// 插件依賴樹的地方
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.configuration = void 0);
const cluster_1 = __importDefault(require("cluster")),
  path_1 = __importDefault(require("path")),
  process_1 = __importDefault(require("process")),
  hook_const_js_1 = require("../../../common/const/hook-const.js"),
  common_const_js_1 = require("../../common/options/common-const.js"),
  hvigor_trace_js_1 = require("../../common/trace/hvigor-trace.js"),
  watch_config_file_js_1 = require("../../daemon/cluster/watch-config-file.js"),
  hvigor_js_1 = require("../../external/core/hvigor.js"),
  hvigor_core_js_1 = require("../../external/core/hvigor-core.js"),
  hvigor_system_plugin_js_1 = require("../../external/plugin/hvigor-system-plugin.js"),
  hvigor_log_js_1 = require("../../log/hvigor-log.js"),
  log_event_js_1 = require("../../metrics/event/log-event.js"),
  file_util_js_1 = require("../../util/file-util.js"),
  time_util_js_1 = require("../../util/time-util.js"),
  global_core_parameters_js_1 = require("../data/global-core-parameters.js"),
  global_data_js_1 = require("../data/global-data.js"),
  task_tree_js_1 = require("../task/build/task-tree.js"),
  tasks_js_1 = require("../task/build/tasks.js"),
  task_prune_js_1 = require("../task/prune/task-prune.js"),
  ts_check_js_1 = require("../util/ts_check.js"),
  hvigor_lifecycle_hook_js_1 = require("./hook/hvigor-lifecycle-hook.js"),
  _log = hvigor_log_js_1.HvigorLogger.getLogger("configuration");
async function configuration(e) {
  const o = "init configuration",
    t = "fin configuration",
    i = e.createSubEvent(o, "Initialize configuration."),
    r = e.createSubEvent("configure project task", "Configure project task."),
    s = e.createSubEvent("eval project", "Evaluate project."),
    n = e.createSubEvent("eval modules", "Evaluate modules."),
    a = e.createSubEvent(
      "add config dependencies",
      "Add configuration dependencies."
    ),
    g =
      (e.createSubEvent(
        "exec before all nodes",
        "Execute before all nodes evaluated."
      ),
      e.createSubEvent(
        "exec after all nodes",
        "Execute after all nodes evaluated."
      ),
      e.createSubEvent(t, "Finish configuration."));
  i.start();
  const l = process_1.default.hrtime(),
    _ = global_data_js_1.globalData.cliEnv,
    project = hvigor_core_js_1.hvigorCore.getProject(),
    u = path_1.default.resolve(
      _.cwd,
      common_const_js_1.HvigorCommonConst.BUILD_FILE_NAME
    );
  i.stop().setLog(o, log_event_js_1.MetricLogType.INFO),
    configProject(project, r),
    // TODO zfc 我要找一下，如何暴露资源的接口
    await evalProject(project, u, s),
    await evalSubModules(project, n),
    addConfigDependencies(a),
    await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
      hook_const_js_1.HookType.nodesEvaluated,
      hvigor_js_1.hvigor
    ),
    await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runFn(
      hvigor_core_js_1.hvigorCore.getHvigorNodesBeforeEvaluatedInternalHook(),
      hvigor_js_1.hvigor
    ),
    await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runFn(
      hvigor_core_js_1.hvigorCore.getHvigorNodesEvaluatedInternalHook(),
      hvigor_js_1.hvigor
    ),
    g.start();
  const f = process_1.default.hrtime(l),
    v = (0, time_util_js_1.formatTime)(f);
  return (
    _log.debug(`Configuration phase cost:${v}`),
    g.stop().setLog(t, log_event_js_1.MetricLogType.INFO),
    project
  );
}

/**
 * 
 * @param {*} project HvigorNodeCore
 * @param {*} o 
 */
function configProject(project, o) {
  o.start(), configNodeTask(project), configProjectTask(project), o.stop().setLog();
}

// sharknade note : evaluateNodeVigorFile 
async function evalProject(e, o, t) {
  t.start();
  const i = hvigor_js_1.hvigor.getNodeByName(e.getName());
  void 0 !== i &&
    (await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
      hook_const_js_1.HookType.beforeNodeEvaluate,
      i
    )),
    await e.executeNodeHook(hook_const_js_1.HookType.beforeNodeEvaluate),
    await evaluateNodeVigorFile(
      e,
      (0, file_util_js_1.findRealHvigorFilePath)(o, _log),
      t
    );
  const r = hvigor_core_js_1.hvigorCore.getHvigorAfterNodeInternalHookList(
    e.getName()
  );
  void 0 !== i &&
    void 0 !== r &&
    (await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runFn(
      r,
      i
    )),
    void 0 !== i &&
      (await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
        hook_const_js_1.HookType.afterNodeEvaluate,
        i
      )),
    await e.executeNodeHook(hook_const_js_1.HookType.afterNodeEvaluate),
    t.stop().setLog();
}
async function evalSubModules(e, o) {
  o.start();
  for (const t of e.getAllSubModules()) {
    const e = "eval submodule",
      i = o.createSubEvent(e, "Evaluate submodule.");
    i.start(), configNodeTask(t);
    const r = hvigor_js_1.hvigor.getNodeByName(t.getName());
    void 0 !== r &&
      (await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
        hook_const_js_1.HookType.beforeNodeEvaluate,
        r
      )),
      await t.executeNodeHook(hook_const_js_1.HookType.beforeNodeEvaluate),
      await evaluateNodeVigorFile(
        t,
        (0, file_util_js_1.findRealHvigorFilePath)(t.getBuildFilePath(), _log),
        i
      );
    const s = hvigor_core_js_1.hvigorCore.getHvigorAfterNodeInternalHookList(
      t.getName()
    );
    void 0 !== r &&
      void 0 !== s &&
      (await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runFn(
        s,
        r
      )),
      void 0 !== r &&
        (await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
          hook_const_js_1.HookType.afterNodeEvaluate,
          r
        )),
      await t.executeNodeHook(hook_const_js_1.HookType.afterNodeEvaluate),
      i.stop().setLog(e, log_event_js_1.MetricLogType.INFO);
  }
  o.stop().setLog();
}
function addConfigDependencies(e) {
  if ((e.start(), cluster_1.default.isWorker)) {
    const e = process_1.default.hrtime();
    (0, watch_config_file_js_1.addConfigDeps)();
    const o = process_1.default.hrtime(e),
      t = (0, time_util_js_1.formatTime)(o);
    _log.debug(`hvigorfile, resolve hvigorfile dependencies in ${t}`);
  }
  e.stop().setLog();
}
function configNodeTask(e) {
  e.registry(new tasks_js_1.Tasks(e)),
    e.registry(new task_tree_js_1.TaskTree(e));
}
function configProjectTask(e) {
  e.registry(new task_prune_js_1.PruneTask(e));
}

// sharknade note ： 绑定系统插件
async function bindSystemPlugins(e, o, t) {
  if (
    (_log.debug("hvigorfile, binding system plugins", e),
    "function" == typeof e)
  ) {
    const t = await e(o);
    return (
      o.bindPlugin(t),
      void o.bindPluginContextFunc(t.getPluginId(), t.getContext.bind(t))
    );
  }
  if (!(e instanceof hvigor_system_plugin_js_1.HvigorSystemPlugin)) {
    Object.keys(e).length ||
      _log.errorMessageExit(
        `Invalid exports, no system plugins were found in hvigorfile: ${t}`
      );
    for (const i of Object.keys(e)) {
      const r = e[i];
      if (r instanceof hvigor_system_plugin_js_1.HvigorSystemPlugin)
        o.bindPlugin(r);
      else if ("function" == typeof r) {
        const e = await r(o);
        e.getPluginId ||
          _log.errorMessageExit(
            `Invalid exports, no system plugins were found in hvigorfile: ${t}`
          ),
          o.bindPlugin(e);
      }
    }
  }
}
async function bindCustomPlugins(e, o, t, i) {
  if (
    (_log.debug("hvigorfile, binding custom plugins", e),
    !e || (Array.isArray(e) && 0 === e.length))
  )
    return void _log.debug(`hvigorfile, no custom plugins were found in ${t}`);
  if (!Array.isArray(e))
    return void _log.warn(
      `hvigorfile, invalid custom plugins config found in ${t}`
    );
  e.forEach((e) => {
    (0, hvigor_trace_js_1.addCustomPlugin)({ PLUGIN_ID: e.pluginId });
  });
  const r = hvigor_core_js_1.hvigorCore.getHvigorNodeByScriptPath(
    t.substring(0, t.lastIndexOf("."))
  );
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    "object" == typeof n && "function" == typeof n.apply
      ? (n.context && o.bindPluginContextFunc(n.pluginId, n.context.bind(n)),
        n.apply &&
          hvigor_core_js_1.hvigorCore.hvigorAfterNodeInternalHook(
            o.getName(),
            async () => {
              const e = "apply custom plugin",
                o = i.createSubEvent(e, `Apply custom plugin ${n.pluginId}.`);
              o.start(),
                _log.debug(
                  `hvigorfile, executing apply function of custom plugin, pluginId = ${n.pluginId}`
                ),
                await n.apply(r),
                o.stop().setLog(e, log_event_js_1.MetricLogType.INFO);
            }
          ))
      : _log.warn(
          `The plugin 'plugins[${s}]' in the file '${t}' is invalid. This plugin will not be loaded. A valid plugin must contain a 'pluginId' with string type and an 'apply' function`
        );
  }
}

// sharknade note: evaluateNodeVigorFile , 评估HvigorFile
async function evaluateNodeVigorFile(e, o, t) {
  const i = "eval hvigorfile",
    r = "require hvigorfile",
    s = "bind plugins",
    n = t.createSubEvent(i, "Evaluate hvigorfile."),
    a = n.createSubEvent(r, "Require hvigorfile."),
    g = n.createSubEvent(s, "Bind plugins.");
  let l;
  n.start(),
    a.start(),
    _log.debug(`hvigorfile, resolving ${o}`),
    global_core_parameters_js_1.coreParameter.startParams.hvigorfileTypeCheck &&
      o.endsWith(".ts") &&
      ts_check_js_1.hvigorfileTSRoots.add(o),
    delete require.cache[require.resolve(o)];
  try {
    (l = require(o)), _log.debug("hvigorfile, require result: ", l);
  } catch (e) {
    _log.errorMessageExit(`${e.name}, ${e.message} in hvigorfile: ${o}`);
  }
  a.stop().setLog(r, log_event_js_1.MetricLogType.INFO), g.start();
  const _ = l.default;
  _ && _.system
    ? (parseConfig(e, l.default.config), // 解析config信息
      await bindSystemPlugins(l.default.system, e, o),
      await e.executeAfterBindSystemPluginsHook(),
      await bindCustomPlugins(l.default.plugins, e, o, g))
    : (await bindSystemPlugins(l, e, o),
      await e.executeAfterBindSystemPluginsHook()),
    _log.debug(`hvigorfile, resolve finished ${o}`),
    cluster_1.default.isWorker &&
      (0, watch_config_file_js_1.addModuleDependency)(o),
    g.stop().setLog(s, log_event_js_1.MetricLogType.INFO),
    n.stop().setLog(i, log_event_js_1.MetricLogType.INFO);
}
function parseConfig(e, o) {
  o && e.loadConfig(o);
}
// sharknade note :  boot方法，调用改函数
exports.configuration = configuration;
