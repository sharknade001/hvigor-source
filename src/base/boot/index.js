"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.boot = void 0);
const process_1 = __importDefault(require("process")),
  wrapper_const_js_1 = require("../../cli/wrapper/wrapper-const.js"),
  hook_const_js_1 = require("../../common/const/hook-const.js"),
  hvigor_js_1 = require("../external/core/hvigor.js"),
  core_task_js_1 = require("../external/task/core-task.js"),
  global_data_js_1 = require("../internal/data/global-data.js"),
  build_task_graph_js_1 = require("../internal/lifecycle/build-task-graph.js"),
  configuration_js_1 = require("../internal/lifecycle/configuration.js"),
  execute_mode_factory_js_1 = require("../internal/lifecycle/execute/mode/execute-mode-factory.js"),
  hvigor_lifecycle_hook_js_1 = require("../internal/lifecycle/hook/hvigor-lifecycle-hook.js"),
  hvigor_process_js_1 = require("../internal/lifecycle/hvigor-process.js"),
  init_js_1 = require("../internal/lifecycle/init.js"),
  log_event_js_1 = require("../metrics/event/log-event.js"),
  metric_factory_js_1 = require("../metrics/metric-factory.js"),
  init_env_config_props_js_1 = require("./hooks/init-env-config-props.js"),
  require_hook_js_1 = require("./hooks/require-hook.js"),
  modeAlias = "mode";
// e: HvigorCliOptions   
async function boot(e) {
  try {
    (0, require_hook_js_1.addExtensionHandler)([".ts", ".mjs"]);
    const o = {
      cwd: process_1.default.cwd(),
      configProps: null,
      version: wrapper_const_js_1.CUR_HVIGOR_VERSION,
    };
    // 缓存HvigorCliOptions 配置参数
    global_data_js_1.globalData.init(o, e),
      (0, init_env_config_props_js_1.initEnvConfigProps)(),
      // 初始化hvigorProcess,包括创建监听等
      hvigor_process_js_1.hvigorProcess.init(),
      hvigor_process_js_1.hvigorProcess.setTaskBeginTime(),
      await start();
  } catch (e) {
    e instanceof Error && hvigor_process_js_1.hvigorProcess.error(e);
  }
}
async function start() {
  const e = "init",
    o = "create hvigor project model",
    t = "configure hvigor plugin",
    r = "build task graph",
    i = "init task execution option",
    s = metric_factory_js_1.MetricFactory.createDurationEvent(
      e,
      "Initialize and build task graph.",
      core_task_js_1.HvigorTaskGroupType.INIT_TASK_GROUP
    ),
    _ = s.createSubEvent(o, "Initialize hvigor project model."),
    a = s.createSubEvent(t, "Configure hvigor plugin."),
    n = s.createSubEvent(r, "Build task graph."),
    c = s.createSubEvent(i, "Init task execution option.");
  s.start(), _.start();
  const l = global_data_js_1.globalData.cliOpts,
    g = global_data_js_1.globalData.cliEnv;
  // 关键代码， hvigor core的一些核心初始化逻辑。   
  await (0, init_js_1.init)(),
    _.stop().setLog(o, log_event_js_1.MetricLogType.INFO),
    a.start();
  // sharknade ： 配置工程阶段  
  const u = await (0, configuration_js_1.configuration)(a);
  a.stop().setLog(t, log_event_js_1.MetricLogType.INFO),
    n.start(),
    (0, build_task_graph_js_1.buildTaskGraph)(u),
    await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
      hook_const_js_1.HookType.taskGraphResolved,
      hvigor_js_1.hvigor
    ),
    n.stop().setLog(r, log_event_js_1.MetricLogType.INFO),
    c.start();
  const p = { toRunTasks: l._, isNeedSync: !!l.sync };
  c.stop().setLog(i, log_event_js_1.MetricLogType.INFO),
    s.stop().setLog(e, log_event_js_1.MetricLogType.INFO);
  const j = g.configProps.get(modeAlias);
  await new execute_mode_factory_js_1.ExecuteModeFactory(u, p)
    .getExecutePipeline(j)
    .startPipeline();
}
exports.boot = boot;
