"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
      ? function (e, o, r, t) {
          void 0 === t && (t = r);
          var a = Object.getOwnPropertyDescriptor(o, r);
          (a && !("get" in a ? !o.__esModule : a.writable || a.configurable)) ||
            (a = {
              enumerable: !0,
              get: function () {
                return o[r];
              },
            }),
            Object.defineProperty(e, t, a);
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
  (exports.startHvigorBuild = exports.parseCommand = void 0);
const commander_1 = require("commander"),
  log4js = __importStar(require("log4js")),
  process_1 = __importDefault(require("process")),
  util_1 = __importDefault(require("util")),
  exit_js_1 = require("../../base/boot/hooks/exit.js"),
  hvigor_daemon_client_log_js_1 = require("../../base/daemon/log/hvigor-daemon-client-log.js"),
  process_info_util_js_1 = require("../../base/daemon/util/process-info-util.js"),
  global_core_parameters_js_1 = require("../../base/internal/data/global-core-parameters.js"),
  global_data_js_1 = require("../../base/internal/data/global-data.js"),
  base_log_js_1 = __importDefault(require("../../base/log/base-log.js")),
  default_configuration_js_1 = require("../../base/log/default-configuration.js"),
  hvigor_log_js_1 = require("../../base/log/hvigor-log.js"),
  std_hook_js_1 = require("../util/std-hook.js"),
  wrapper_const_js_1 = require("../wrapper/wrapper-const.js"),
  check_hvigor_config_before_program_js_1 = require("../../base/util/check-hvigor-config-before-program.js"),
  cliVersion = wrapper_const_js_1.CUR_HVIGOR_VERSION,
  _log = hvigor_log_js_1.HvigorLogger.getLogger("hvigor"),
  hvigorCommandMixin = {
    flagPair(e, o) {
      return this.option(`--${e}`, `Enable ${o}`).option(
        `--no-${e}`,
        `Disable ${o}`
      );
    },
    deprecatedOption(e, o, r) {
      return this.option(e, `['${e}' deprecated: use '${o}' instead] ${r}`);
    },
  };
function parseCommand() {
  (0, std_hook_js_1.initHook)();
  let e = [];
  commander_1.program
    .version(cliVersion, "-v, --version", "Show version of Hvigor.")
    .name("hvigor")
    .usage("[taskNames...] <options...>")
    .option("-e, --error", "Set log level to error.")
    .option("-w, --warn", "Set log level to warn.")
    .option("-i, --info", "Set log level to info.")
    .option("-d, --debug", "Set log level to debug.")
    .option(
      "-c, --config <config>",
      "Set properties in the hvigor-config.json5 file. The settings will overwrite those in the file.",
      (e, o = []) => o.concat(e)
    )
    .option(
      "-p, --prop <value>",
      "Define extra properties.",
      (e, o) => o.concat([e]),
      []
    )
    .option(
      "-m, --mode <string>",
      "Specifies the mode in which the command is currently executed."
    )
    .option("-s, --sync", "Sync the information in plugin for other platform.")
    .option("--node-home, <string>", "Specifies the nodejs location.")
    .option("--stop-daemon", "Shut down current project's daemon process.")
    .option("--stop-daemon-all", "Shut down all projects' daemon process.")
    .option(
      "--status-daemon",
      "Show all daemon process's status of the project."
    )
    .option("--verbose-analyze", "building analyze in detail.")
    .option("--watch", "Enable watch mode")
    .deprecatedOption(
      "--enable-build-script-type-check",
      "type-check",
      "Enable the build script hvigorfile.ts type check."
    )
    .flagPair("stacktrace", "printing out the stacktrace for all exceptions.")
    .flagPair("type-check", "the build script hvigorfile.ts type check.")
    .flagPair("parallel", "parallel building mode.")
    .flagPair("incremental", "incremental building mode.")
    .flagPair("daemon", "building with daemon process.")
    .flagPair("generate-build-profile", "generate BuildProfile.ets files.")
    .flagPair("analyze", "building analyze.")
    .option(
      "--analyze=<analysisMode>",
      "Specifies build analysis mode: normal(default value), advanced and false."
    )
    .addHelpText(
      "after",
      "\nExamples:\n  hvigor assembleApp  Do assembleApp task\n"
    )
    .addHelpText("after", "copyright 2023")
    .allowUnknownOption(),
    commander_1.program.arguments("[taskNames...]").action((o) => (e = o)),
    commander_1.program
      .command("version")
      .action(() => {
        _log.info("CLI version:", cliVersion),
          _log.info("Local version:", cliVersion || "Unknown"),
          (0, exit_js_1.exit)(0);
      })
      .description("Show version of Hvigor."),
    commander_1.program
      .command("tasks")
      .action(() => {
        e.unshift("tasks");
      })
      .description("Show all available tasks of specific modules."),
    commander_1.program
      .command("taskTree")
      .action(() => {
        e.unshift("taskTree");
      })
      .description("Show all available taskTree of specific modules."),
    commander_1.program
      .command("prune")
      .action(() => {
        e.unshift("prune");
      })
      .description(
        "Clean up old hvigor cache files and remove unreferenced packages from store."
      ),
    commander_1.program
      .command("collectCoverage")
      .action(() => {
        e.unshift("collectCoverage");
      })
      .description(
        "Generate coverage statistics reports based on instrumentation dotting data."
      ),
    commander_1.program.parse(process_1.default.argv);
  const o = { ...commander_1.program.opts(), _: e };
  return (
    (0, check_hvigor_config_before_program_js_1.checkHvigorConfigBeforeProgram)(
      o,
      base_log_js_1.default
    ).result || (0, exit_js_1.exit)(-1),
    (0, global_data_js_1.initStartData)(o),
    initLogger(),
    (0, hvigor_log_js_1.evaluateLogLevel)(
      global_core_parameters_js_1.coreParameter.startParams.logLevel
    ),
    o
  );
}
function initDaemonClientLogger() {
  (0, hvigor_daemon_client_log_js_1.configureDaemonClient)(),
    (0, hvigor_log_js_1.evaluateLogLevel)(
      global_core_parameters_js_1.coreParameter.startParams.logLevel
    );
}
function initLogger() {
  log4js.shutdown(),
    log4js.configure((0, default_configuration_js_1.getConfiguration)());
}

// 开始构建
async function startHvigorBuild(e) {
  if (
    (e.stopDaemon && (0, process_info_util_js_1.stopDaemons)(!1),
    e.stopDaemonAll && (0, process_info_util_js_1.stopDaemons)(!0),
    e.statusDaemon && (0, process_info_util_js_1.logDaemonInfo)(),
    _log.debug(
      `env: daemon=${global_core_parameters_js_1.coreParameter.startParams.daemon}`
    ),
    global_core_parameters_js_1.coreParameter.startParams.daemon)
  ) {
    initDaemonClientLogger();
    const { daemonBoot: o } = require("./daemon-client.js");
    await o(e);
  } else {
    process_1.default.execArgv.length > 0
      ? _log.debug(
          `no-daemon, use the parent process.execArgv ${process_1.default.execArgv}`
        )
      : _log.debug("no-daemon, use the default node options");
    // 执行Boot方法  
    const { boot: o } = require("../../base/boot/index.js");
    await o(e);
  }
  _log.debug(`hvigor start cli arguments:${util_1.default.inspect(e)}`);
}
Object.assign(commander_1.Command.prototype, hvigorCommandMixin),
  (exports.parseCommand = parseCommand),
  (exports.startHvigorBuild = startHvigorBuild);
