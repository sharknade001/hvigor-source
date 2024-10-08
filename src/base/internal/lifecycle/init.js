"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
      ? function (e, o, r, t) {
          void 0 === t && (t = r);
          var i = Object.getOwnPropertyDescriptor(o, r);
          (i && !("get" in i ? !o.__esModule : i.writable || i.configurable)) ||
            (i = {
              enumerable: !0,
              get: function () {
                return o[r];
              },
            }),
            Object.defineProperty(e, t, i);
        }
      : function (e, o, r, t) {
          void 0 === t && (t = r), (e[t] = o[r]);
        }),
  __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
      ? function (e, o) {
          Object.defineProperty(e, "default", { enumerable: !0, value: o });
        }
      : function (e, o) {
          e.default = o;
        }),
  __importStar =
    (this && this.__importStar) ||
    function (e) {
      if (e && e.__esModule) return e;
      var o = {};
      if (null != e)
        for (var r in e)
          "default" !== r &&
            Object.prototype.hasOwnProperty.call(e, r) &&
            __createBinding(o, e, r);
      return __setModuleDefault(o, e), o;
    },
  __importDefault =
    (this && this.__importDefault) ||
    function (e) {
      return e && e.__esModule ? e : { default: e };
    };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.init = void 0);
const cluster_1 = __importDefault(require("cluster")),
  fs_1 = __importDefault(require("fs")),
  path_1 = __importDefault(require("path")),
  process_1 = __importDefault(require("process")),
  util = __importStar(require("util")),
  hook_const_js_1 = require("../../../common/const/hook-const.js"),
  system_util_js_1 = require("../../../common/util/system-util.js"),
  common_const_js_1 = require("../../common/options/common-const.js"),
  watch_config_file_js_1 = require("../../daemon/cluster/watch-config-file.js"),
  hvigor_js_1 = require("../../external/core/hvigor.js"),
  hvigor_config_js_1 = require("../../external/core/hvigor-config.js"),
  hvigor_core_js_1 = require("../../external/core/hvigor-core.js"),
  hvigor_log_js_1 = require("../../log/hvigor-log.js"),
  file_util_js_1 = require("../../util/file-util.js"),
  time_util_js_1 = require("../../util/time-util.js"),
  validate_util_js_1 = require("../../util/validate-util.js"),
  project_cache_service_js_1 = require("../cache/project-cache-service.js"),
  global_core_parameters_js_1 = require("../data/global-core-parameters.js"),
  global_data_js_1 = require("../data/global-data.js"),
  ts_check_js_1 = require("../util/ts_check.js"),
  hvigor_lifecycle_hook_js_1 = require("./hook/hvigor-lifecycle-hook.js"),
  module_impl_js_1 = require("./hvigor-node-impl/module-impl.js"),
  project_impl_js_1 = require("./hvigor-node-impl/project-impl.js"),
  propertiesAlias = "prop",
  log = hvigor_log_js_1.HvigorLogger.getLogger("hvigor-init");
async function init() {
  var e;
  const o = global_data_js_1.globalData.cliEnv,
    r = global_data_js_1.globalData.cliOpts._,
    t = hvigor_lifecycle_hook_js_1.HvigorLifecycleHook.getInstance();
  promptUpdateNode(),
    hvigor_core_js_1.hvigorCore.setExtraConfig(o.configProps.get("prop")),
    hvigor_core_js_1.hvigorCore.setCommandEntryTasks(r);
  const i = o.cwd,
    _ = new project_impl_js_1.ProjectImpl(path_1.default.basename(i), i);
  t.clear(),
    (0, hvigor_config_js_1.hvigorConfigInit)(_),
    // evaluate config 配置文件
    evaluateHvigorConfig(),
    await t.runHook(
      hook_const_js_1.HookType.configEvaluated,
      hvigor_js_1.hvigor.getHvigorConfig()
    ),
    null ===
      (e = hvigor_js_1.hvigor
        .getHvigorConfig()
        .getRootNodeDescriptor()
        .getChildNode()) ||
      void 0 === e ||
      e.forEach((e) => {
        validate_util_js_1.ValidateUtil.validateModule(
          new (class {
            constructor() {
              (this.name = e.name), (this.srcPath = e.srcPath);
            }
          })()
        );
        const o = new module_impl_js_1.ModuleImpl(
          _,
          e.name,
          path_1.default.resolve(i, e.srcPath)
        );
        (0, file_util_js_1.exitIfNotExists)(
          log,
          o.getNodeDir(),
          "modules",
          path_1.default.resolve(
            _.getNodeDir(),
            common_const_js_1.HvigorCommonConst.BUILD_PROFILE_FILE
          )
        ),
          e.extraOptions.forEach((e, r) => {
            o.addExtraOption(r, e);
          }),
          _.addSubModule(o);
      }),
    hvigor_core_js_1.hvigorCore.initRootProject(_),
    await t.runHook(
      hook_const_js_1.HookType.nodesInitialized,
      hvigor_js_1.hvigor
    ),
    log.debug(
      `Hvigor init with startParameters:${util.inspect(
        global_core_parameters_js_1.coreParameter.startParams
      )}`
    ),
    global_core_parameters_js_1.coreParameter.startParams
      .incrementalExecution && initCacheService(_);
}
function initCacheService(e) {
  const o = process_1.default.hrtime();
  project_cache_service_js_1.ProjectCacheService.getInstance(e).initialize();
  const r = process_1.default.hrtime(o),
    t = (0, time_util_js_1.formatTime)(r);
  log.debug(`Cache service initialization finished in ${t}`);
}
function promptUpdateNode() {
  global_core_parameters_js_1.coreParameter.startParams.analyze ===
    global_core_parameters_js_1.AnalyzeMode.ADVANCED &&
    !(0, system_util_js_1.isWindows)() &&
    process_1.default.version < "v18.14.1" &&
    log.warn(
      "In advanced mode, to enhance performance, node version v18.14.1 or later is preferred."
    );
}
function evaluateHvigorConfig() {
  const e = path_1.default.resolve(
    hvigor_js_1.hvigor.getHvigorConfig().getRootNodeDescriptor().srcPath,
    common_const_js_1.HvigorCommonConst.HVIGOR_CONFIG_FILE_NAME
  );
  let o;
  for (const r of common_const_js_1.HvigorCommonConst
    .HVIGOR_CONFIG_FILE_NAME_SUFFIX)
    if (((o = `${e}${r}`), fs_1.default.existsSync(o))) {
      global_core_parameters_js_1.coreParameter.startParams
        .hvigorfileTypeCheck &&
        o.endsWith(".ts") &&
        (0, ts_check_js_1.setHvigorConfigFileTsRoot)(o),
        delete require.cache[require.resolve(o)];
      try {
        require(o), log.debug("hvigorconfig, required");
      } catch (e) {
        log.errorMessageExit(`${e.name}, ${e.message} in hvigorconfig: ${o}`);
      }
      cluster_1.default.isWorker &&
        (0, watch_config_file_js_1.addModuleDependency)(o);
    }
}
exports.init = init;
