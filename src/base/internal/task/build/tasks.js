"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
      ? function (e, t, s, r) {
          void 0 === r && (r = s);
          var o = Object.getOwnPropertyDescriptor(t, s);
          (o && !("get" in o ? !t.__esModule : o.writable || o.configurable)) ||
            (o = {
              enumerable: !0,
              get: function () {
                return t[s];
              },
            }),
            Object.defineProperty(e, r, o);
        }
      : function (e, t, s, r) {
          void 0 === r && (r = s), (e[r] = t[s]);
        }),
  __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
      ? function (e, t) {
          Object.defineProperty(e, "default", { enumerable: !0, value: t });
        }
      : function (e, t) {
          e.default = t;
        }),
  __importStar =
    (this && this.__importStar) ||
    function (e) {
      if (e && e.__esModule) return e;
      var t = {};
      if (null != e)
        for (var s in e)
          "default" !== s &&
            Object.prototype.hasOwnProperty.call(e, s) &&
            __createBinding(t, e, s);
      return __setModuleDefault(t, e), t;
    };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.Tasks = void 0);
const os = __importStar(require("os")),
  core_task_js_1 = require("../../../external/task/core-task.js"),
  default_task_js_1 = require("../../../external/task/default-task.js"),
  hvigor_log_js_1 = require("../../../log/hvigor-log.js"),
  log = hvigor_log_js_1.HvigorLogger.getLogger("no-pattern-info");
class Tasks extends default_task_js_1.DefaultTask {
  constructor(e) {
    super(e, {
      name: "tasks",
      group: core_task_js_1.HvigorTaskGroupType.HELP_TASK_GROUP,
      isEnabled: !0,
      description: "Displays the tasks of the HvigorCoreNode.",
    });
  }
  registryAction() {
    return () => {
      const e = this.node.getName(),
        t = this.node.getAllTasks(),
        s = [
          "--------------------------------------------------------------------------",
          `All tasks from hvigor node '${e}'`,
          "--------------------------------------------------------------------------",
          `${this.transformInfos(t).join(os.EOL)}`,
        ];
      log.info(s.join(os.EOL));
    };
  }
  transformInfos(e) {
    const t = new Map();
    e.forEach((e) => {
      const s = e.getGroup();
      t.has(s) ? t.get(s).push(e) : t.set(s, [e]);
    });
    const s = [];
    return (
      t.forEach((e, t) => {
        s.push(`${t} tasks`), s.push("-------------");
        for (const t of e)
          t.getDescription()
            ? s.push(`${t.getName()} - ${t.getDescription()}`)
            : s.push(`${t.getName()}`);
        s.push("");
      }),
      s
    );
  }
}
exports.Tasks = Tasks;
