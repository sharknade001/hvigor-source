"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.PruneTask = void 0);
const child_process_1 = require("child_process"),
  fs_1 = __importDefault(require("fs")),
  path_1 = __importDefault(require("path")),
  path_const_js_1 = require("../../../../common/const/path-const.js"),
  core_task_js_1 = require("../../../external/task/core-task.js"),
  default_task_js_1 = require("../../../external/task/default-task.js"),
  hvigor_log_js_1 = require("../../../log/hvigor-log.js"),
  json_reader_js_1 = require("../../../util/json-reader.js"),
  THIRTY_DAYS_MS = 2592e6,
  LOG = hvigor_log_js_1.HvigorLogger.getLogger("prune");
class PruneTask extends default_task_js_1.DefaultTask {
  constructor(e) {
    super(e, {
      name: "prune",
      group: core_task_js_1.HvigorTaskGroupType.OTHER_TASK_GROUP,
      isEnabled: !0,
      description:
        "Clean up old hvigor cache files and remove unreferenced packages from store.",
    });
  }
  registryAction() {
    return async () => {
      LOG.info("Clear the cache of the hvigor file");
      const e = await deleteCacheFiles();
      await Promise.all(e),
        LOG.info("Remove unreferenced packages from the store"),
        execStorePruneCommand();
    };
  }
}
async function deleteCacheFiles() {
  if (!fs_1.default.existsSync(path_const_js_1.HVIGOR_PROJECT_CACHES_HOME))
    return [];
  return fs_1.default
    .readdirSync(path_const_js_1.HVIGOR_PROJECT_CACHES_HOME)
    .map(async (e) => {
      const r = path_1.default.resolve(
        path_const_js_1.HVIGOR_PROJECT_CACHES_HOME,
        e
      );
      if (fs_1.default.statSync(r).isDirectory()) {
        const e = path_1.default.resolve(r, "workspace", "metadata.json");
        fs_1.default.existsSync(e) &&
          fs_1.default.statSync(e).isFile() &&
          needDeleteDir(e) &&
          (LOG.info("Clear the hvigor cache file: ", r),
          await fs_1.default.promises.rm(r, { force: !0, recursive: !0 }));
      }
    });
}
function execStorePruneCommand() {
  var e;
  const r = {
      cwd: path_const_js_1.HVIGOR_WRAPPER_TOOLS_HOME,
      stdio: ["inherit", "inherit", "inherit"],
      windowsHide: !0,
    },
    t = (0, child_process_1.spawnSync)(
      path_const_js_1.HVIGOR_WRAPPER_PNPM_SCRIPT_PATH,
      ["store", "prune"],
      r
    );
  0 !== t.status &&
    LOG.errorMessageExit(
      `Error: pnpm store prune execute failed. ${
        null === (e = t.error) || void 0 === e ? void 0 : e.message
      }`
    );
}
function needDeleteDir(e) {
  const r = json_reader_js_1.JsonReader.getJsonObj(e).lastUpdatedTime;
  return !!r && new Date(new Date().getTime() - THIRTY_DAYS_MS).getTime() > r;
}
exports.PruneTask = PruneTask;
