"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.hvigorProcess = void 0);
const wdk_1 = require("@baize/wdk"),
  cluster_1 = __importDefault(require("cluster")),
  events_1 = __importDefault(require("events")),
  fs_extra_1 = __importDefault(require("fs-extra")),
  path_1 = __importDefault(require("path")),
  process_1 = __importDefault(require("process")),
  wrapper_const_js_1 = require("../../../cli/wrapper/wrapper-const.js"),
  hook_const_js_1 = require("../../../common/const/hook-const.js"),
  path_util_js_1 = require("../../../common/util/path-util.js"),
  replacer_js_1 = require("../../../common/util/replacer.js"),
  report_service_impl_js_1 = require("../../common/report/report-service-impl.js"),
  hvigor_trace_js_1 = require("../../common/trace/hvigor-trace.js"),
  trace_build_analyze_js_1 = require("../../common/trace/trace-build-analyze.js"),
  watch_config_file_js_1 = require("../../daemon/cluster/watch-config-file.js"),
  worker_process_event_id_js_1 = require("../../daemon/cluster/worker-process-event-id.js"),
  hvigor_daemon_log_js_1 = require("../../daemon/log/hvigor-daemon-log.js"),
  hvigor_core_js_1 = require("../../external/core/hvigor-core.js"),
  default_tooling_model_bean_registry_js_1 = require("../../external/default-tooling-model-bean-registry.js"),
  build_result_js_1 = require("../../external/models/build-result.js"),
  log_adaptor_js_1 = require("../../log/adaptor/log-adaptor.js"),
  mark_event_js_1 = require("../../metrics/event/mark-event.js"),
  metric_factory_js_1 = require("../../metrics/metric-factory.js"),
  metric_service_js_1 = require("../../metrics/metric-service.js"),
  time_util_js_1 = require("../../util/time-util.js"),
  project_cache_service_js_1 = require("../cache/project-cache-service.js"),
  global_core_parameters_js_1 = require("../data/global-core-parameters.js"),
  global_core_parameters_js_2 = require("../data/global-core-parameters.js"),
  global_data_js_1 = require("../data/global-data.js"),
  tcb_store_js_1 = require("../pool/store/tcb-store.js"),
  watch_worker_js_1 = require("../pool/worker-pool/watch-worker.js"),
  worker_pool_factory_js_1 = require("../pool/worker-pool/worker-pool-factory.js"),
  task_control_center_js_1 = require("../task/core/task-control-center.js"),
  task_directed_acyclic_graph_js_1 = require("../task/core/task-directed-acyclic-graph.js"),
  event_id_options_js_1 = require("./event/event-id-options.js"),
  hvigor_lifecycle_hook_js_1 = require("./hook/hvigor-lifecycle-hook.js"),
  sync_js_1 = require("./sync.js"),
  _log = hvigor_daemon_log_js_1.HvigorDaemonLogger.getLogger("hvigor-process");
class HvigorBuildProcess extends events_1.default {
  constructor() {
    super(),
      (this.hasTaskDone = !1),
      process_1.default.on("message", (e) => {
        e.type === event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FAILED &&
          this.emit(
            event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FAILED,
            null == e ? void 0 : e.reason
          );
      });
  }
  init() {
    // 这可能是一个 事件总线
    this.once(
      event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FINISHED,
      async () => {
        await hvigorProcessListenerFactory.getProcessListenerByEventName(
          event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FINISHED
        )();
      }
    ),
      this.once(
        event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FAILED,
        async (e) => {
          await hvigorProcessListenerFactory.getProcessListenerByEventName(
            event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FAILED
          )(e);
        }
      );
  }
  setTaskBeginTime() {
    this.taskBeginTime = process_1.default.hrtime();
  }
  close() {
    (this.hasTaskDone = !1),
      _log.debug("hvigor build process will be closed."),
      this.removeAllListeners();
  }
  error(e, r) {
    const t = null != r ? r : _log;
    t.debug("hvigor build process will be closed with an error."),
      "AdaptorError" !== e.name &&
        ((null == e ? void 0 : e.message)
          ? t.printError(
              new log_adaptor_js_1.HvigorGlobalErrorAdaptor(
                e.message,
                global_data_js_1.globalData.buildId
              ).getLogMessage()
            )
          : t.error(e)),
      e.stack &&
        (global_core_parameters_js_2.coreParameter.startParams.printStackTrace
          ? t.error(e.stack)
          : (t.debug("ERROR: stacktrace =", e.stack),
            _log._printStackErrorToFile(e.stack))),
      exports.hvigorProcess.emit(
        event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FAILED,
        e
      );
  }
}
class HvigorProcessListenerFactory {
  getProcessListenerByEventName(e) {
    switch (e) {
      case event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FINISHED:
        return this.getFinishedEventListener();
      case event_id_options_js_1.HVIGOR_PROCESS_EVENT_ID.FAILED:
        return this.getFailedEventListener();
      default:
        return wdk_1.noop;
    }
  }
  getFailedEventListener() {
    return async (e) => {
      const r = global_data_js_1.globalData.cliEnv;
      await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
        hook_const_js_1.HookType.buildFinished,
        new build_result_js_1.BuildResult(
          e ? ("string" == typeof e ? new Error(e) : e) : null,
          report_service_impl_js_1.ReportServiceImpl.getInstance().getReport()
        )
      );
      const t = process_1.default.hrtime(exports.hvigorProcess.taskBeginTime);
      this.historyDataRecord(
        exports.hvigorProcess.taskBeginTime,
        mark_event_js_1.MarkEventState.FAILED
      );
      const o = (0, time_util_js_1.formatTime)(t);
      _log.error(`BUILD FAILED in ${o}`),
        (process_1.default.exitCode = -1),
        wrapUpBeforeExit(r.cwd, 1e9 * t[0] + t[1]),
        cluster_1.default.isWorker &&
          process_1.default.send({
            type: worker_process_event_id_js_1.WORKER_PROCESS_EVENT_ID.FAILED,
          }),
        exitHvigor(process_1.default.exitCode);
    };
  }
  getFinishedEventListener() {
    const e = global_data_js_1.globalData.cliOpts,
      r = global_data_js_1.globalData.cliEnv;
    return e.sync
      ? async () => {
          // 执行构建完成的回掉方法
          await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
            hook_const_js_1.HookType.buildFinished,
            new build_result_js_1.BuildResult(
              null,
              report_service_impl_js_1.ReportServiceImpl.getInstance().getReport()
            )
          ),
            (0, sync_js_1.outputPluginSyncInfo)(),
            cluster_1.default.isWorker &&
              process_1.default.send({
                type: worker_process_event_id_js_1.WORKER_PROCESS_EVENT_ID
                  .FINISHED,
              }),
            exitHvigor();
        }
      : async () => {
          var e;
          await hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance().runHook(
            hook_const_js_1.HookType.buildFinished,
            new build_result_js_1.BuildResult(
              null,
              report_service_impl_js_1.ReportServiceImpl.getInstance().getReport()
            )
          );
          const t = process_1.default.hrtime(
              exports.hvigorProcess.taskBeginTime
            ),
            o = (0, time_util_js_1.formatTime)(t);
          let s = mark_event_js_1.MarkEventState.SUCCESS;
          if (exports.hvigorProcess.hasTaskDone)
            _log.info(`BUILD SUCCESSFUL in ${o}`);
          else {
            const r = global_data_js_1.globalData.cliOpts;
            _log.printErrorExit(
              new log_adaptor_js_1.HvigorLogAdaptor(
                "HE10102",
                global_data_js_1.globalData.buildId
              )
                .formatMessage(
                  r._,
                  null === (e = hvigor_core_js_1.hvigorCore.getProject()) ||
                    void 0 === e
                    ? void 0
                    : e.getName()
                )
                .getLogMessage()
            ),
              _log.error(`BUILD FAILED in ${o}`),
              (s = mark_event_js_1.MarkEventState.FAILED);
          }
          this.historyDataRecord(exports.hvigorProcess.taskBeginTime, s),
            wrapUpBeforeExit(r.cwd, 1e9 * t[0] + t[1]),
            cluster_1.default.isWorker &&
              process_1.default.send({
                type: worker_process_event_id_js_1.WORKER_PROCESS_EVENT_ID
                  .FINISHED,
              }),
            exitHvigor();
        };
  }
  historyDataRecord(e, r) {
    if (!e) return;
    const t = global_data_js_1.globalData.cliOpts._.toString(),
      o = "clean" !== t,
      s = metric_factory_js_1.MetricFactory.createMarkEvent(t, "");
    let _;
    (_ = global_core_parameters_js_2.coreParameter.startParams.daemon
      ? global_data_js_1.globalData.cliOpts.completeCommand
      : process_1.default.argv.slice(2).join(" ")),
      s.setCompleteCommand(
        `${JSON.stringify(global_data_js_1.globalData.cliOpts)};${
          null != _ ? _ : t
        }`
      ),
      s.setHvigorVersion(wrapper_const_js_1.CUR_HVIGOR_VERSION),
      s.setMarkType(mark_event_js_1.MarkEventType.HISTORY),
      s.setNodeVersion(process_1.default.version),
      s.setCategory(
        o
          ? mark_event_js_1.MarkEventCategory.BUILD
          : mark_event_js_1.MarkEventCategory.CLEAN
      ),
      s.start(mark_event_js_1.MarkEventState.RUNNING, this.resolveTaskTime(e)),
      s.stop(r);
  }
  resolveTaskTime(e) {
    return e && e[0] && e[1] ? 1e9 * e[0] + e[1] : 0;
  }
}
const hvigorProcessListenerFactory = new HvigorProcessListenerFactory();
function traceEnd(e, r) {
  hvigor_trace_js_1.hvigorTrace.totalTime = r;
  const t = path_util_js_1.PathUtil.getHvigorCacheDir(_log),
    o = "./outputs/logs/details";
  fs_extra_1.default.existsSync(path_1.default.resolve(t, o)) ||
    fs_extra_1.default.mkdirSync(path_1.default.resolve(t, o), {
      recursive: !0,
    });
  try {
    fs_extra_1.default.writeFileSync(
      path_1.default.resolve(t, o, "details.json"),
      JSON.stringify(
        trace_build_analyze_js_1.traceBuildAnalyze.getData(),
        replacer_js_1.replacer,
        2
      )
    );
  } catch (e) {}
}
function clearProcessContext() {
  watch_worker_js_1.normalWorker.reset(),
    metric_service_js_1.MetricService.getInstance().clear(),
    task_directed_acyclic_graph_js_1.projectTaskDag.clear(),
    task_control_center_js_1.taskControlCenter.clear(),
    default_tooling_model_bean_registry_js_1.defaultModelRegistry.clear(),
    hvigor_core_js_1.hvigorCore.reset(),
    exports.hvigorProcess.close(),
    (0, global_data_js_1.resetStartData)();
}
function wrapUpBeforeExit(e, r) {
  const t = hvigor_core_js_1.hvigorCore.getProject();
  if (t) {
    project_cache_service_js_1.ProjectCacheService.getInstance(t).close();
  }
  if (
    (traceEnd(e, r),
    global_core_parameters_js_2.coreParameter.startParams.analyze !==
      global_core_parameters_js_1.AnalyzeMode.FALSE)
  ) {
    report_service_impl_js_1.ReportServiceImpl.getInstance().report();
  }
}
function exitHvigor(e) {
  hvigor_core_js_1.hvigorCore.writeMetaProperties(),
    global_data_js_1.globalData.clean(),
    setImmediate(() => {
      const e = (e) => {
        e && tcb_store_js_1.TcbStore.clear();
      };
      worker_pool_factory_js_1.WorkerPoolFactory.getDefaultWorkerPool().isResident() &&
      global_core_parameters_js_2.coreParameter.startParams.daemon
        ? worker_pool_factory_js_1.WorkerPoolFactory.getDefaultWorkerPool()
            .recycle()
            .then(e)
        : worker_pool_factory_js_1.WorkerPoolFactory.getDefaultWorkerPool()
            .terminate()
            .then(e),
        clearProcessContext();
    }),
    (0, watch_config_file_js_1.setRunning)(!1),
    global_core_parameters_js_2.coreParameter.startParams.daemon ||
      process_1.default.removeAllListeners();
}
exports.hvigorProcess = new HvigorBuildProcess();
