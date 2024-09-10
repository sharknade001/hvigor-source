"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.hvigorCore =
    exports.getHvigorConfigValue =
    exports.getNode =
    exports.getHvigorNode =
      void 0);
const fs_1 = __importDefault(require("fs")),
  path_1 = __importDefault(require("path")),
  wrapper_const_js_1 = require("../../../cli/wrapper/wrapper-const.js"),
  const_js_1 = require("../../../common/const/const.js"),
  path_const_js_1 = require("../../../common/const/path-const.js"),
  path_const_js_2 = require("../../../common/const/path-const.js"),
  tree_node_js_1 = require("../../../common/util/tree-node.js"),
  extra_config_js_1 = require("../../data/extra-config.js"),
  parameters_js_1 = require("../../data/parameters.js"),
  file_util_js_1 = require("../../util/file-util.js"),
  json5_reader_js_1 = require("../../util/json5-reader.js"),
  meta_util_js_1 = require("../../util/meta-util.js"),
  hvigor_node_impl_js_1 = require("../../vigor/plugin/impl/hvigor-node-impl.js");
class HvigorCore {
  constructor() {
    (this._hvigorAfterNodeInternalHook = new Map()),
      (this._hvigorNodesEvaluatedInternalHook = []),
      (this._hvigorNodesBeforeEvaluatedInternalHook = []),
      (this.version = wrapper_const_js_1.CUR_HVIGOR_VERSION),
      (this._project = void 0),
      (this._extraConfig = new Map()),
      (this._scriptMap = new Map()),
      (this.metaInfo = new Map());
  }
  versionChanged() {
    const e = (0, meta_util_js_1.getLastHvigorVersion)() !== this.version;
    return e && this.updateMetaProperty("hvigorVersion", this.version), e;
  }
  updateMetaProperty(e, t) {
    this.metaInfo.set(e, t);
  }
  writeMetaProperties() {
    (0, meta_util_js_1.updateMetaProperties)(this.metaInfo),
      this.metaInfo.clear();
  }
  getMetaProperty(e) {
    return (0, meta_util_js_1.getMetaProperty)(e);
  }
  getProject() {
    return this._project;
  }
  getParameter() {
    return new parameters_js_1.ExternalParameter();
  }
  getModuleByScriptPath(e) {
    return this._scriptMap.get(e);
  }
  getHvigorNodeByScriptPath(e) {
    var t;
    return null === (t = this._hvigorNodeTree.findNodeByKeyBFS(e)) ||
      void 0 === t
      ? void 0
      : t.value;
  }
  getParentNodeByScriptPath(e) {
    var t;
    return null === (t = this._hvigorNodeTree.findParentNodeByKey(e)) ||
      void 0 === t
      ? void 0
      : t.value;
  }
  getSubNodeByScriptPath(e) {
    var t;
    return null === (t = this._hvigorNodeTree.findNodeByKeyBFS(e)) ||
      void 0 === t
      ? void 0
      : t.children.map((e) => e.value);
  }
  getExtraConfig() {
    return this._extraConfig;
  }
  setExtraConfig(e) {
    (this._extraConfig = e),
      (0, extra_config_js_1.setExtraConfig)(this._extraConfig);
  }
  isCommandEntryTask(e) {
    return !!this._commandEntryTasks && this._commandEntryTasks.includes(e);
  }
  setCommandEntryTasks(e) {
    this._commandEntryTasks = e;
  }
  getCommandEntryTasks() {
    return this._commandEntryTasks;
  }
  // 初始化项目根目录
  initRootProject(e) {
    (this._project = e),
      this._scriptMap.set(e.getBuildFilePath(), this._project);
    const t = new hvigor_node_impl_js_1.HvigorNodeImpl(this._project);
    (this._hvigorNodeTree = new tree_node_js_1.Tree(e.getBuildFilePath(), t)),
      this.initSubModules(e.getAllSubModules());
  }
  initSubModules(e) {
    e.forEach((e) => {
      this._scriptMap.set(e.getBuildFilePath(), e),
        this._hvigorNodeTree.addNode(
          e.getBuildFilePath(),
          new hvigor_node_impl_js_1.HvigorNodeImpl(e),
          this._project.getBuildFilePath()
        );
    });
  }
  reset() {
    var e, t, r, o;
    const i = new Set();
    i.add(
      (0, file_util_js_1.findRealHvigorFilePath)(
        null === (e = this._project) || void 0 === e
          ? void 0
          : e.getBuildFilePath()
      )
    ),
      null === (t = this._project) ||
        void 0 === t ||
        t.getAllSubModules().forEach((e) => {
          i.add(
            (0, file_util_js_1.findRealHvigorFilePath)(e.getBuildFilePath())
          );
        }),
      i.forEach((e) => {
        if (!e) return;
        const t = require(e);
        if (t)
          for (const e of Object.keys(t))
            "object" == typeof t[e] && (t[e] = void 0);
      }),
      this._extraConfig.clear(),
      this._scriptMap.clear(),
      null === (r = this._project) ||
        void 0 === r ||
        r.getAllSubModules().forEach((e) => {
          e.getTaskContainer().clearTasks(), e.clearTaskGraph();
        }),
      null === (o = this._project) ||
        void 0 === o ||
        o.getTaskContainer().clearTasks(),
      (this._project = void 0),
      (this._commandEntryTasks = void 0);
  }
  hvigorAfterNodeInternalHook(e, t) {
    const r = this._hvigorAfterNodeInternalHook.get(e);
    if (r) r.push(t);
    else {
      const r = [];
      r.push(t), this._hvigorAfterNodeInternalHook.set(e, r);
    }
  }
  getHvigorAfterNodeInternalHookList(e) {
    return this._hvigorAfterNodeInternalHook.get(e);
  }
  hvigorNodeEvaluatedInternalHook(e) {
    this._hvigorNodesEvaluatedInternalHook.push(e);
  }
  hvigorNodeBeforeEvaluatedInternalHook(e) {
    this._hvigorNodesBeforeEvaluatedInternalHook.push(e);
  }
  getHvigorNodesEvaluatedInternalHook() {
    return this._hvigorNodesEvaluatedInternalHook;
  }
  getHvigorNodesBeforeEvaluatedInternalHook() {
    return this._hvigorNodesBeforeEvaluatedInternalHook;
  }
  clearHvigorInternalHookList() {
    this._hvigorAfterNodeInternalHook.clear(),
      (this._hvigorNodesEvaluatedInternalHook = []),
      (this._hvigorNodesBeforeEvaluatedInternalHook = []);
  }
}
function getHvigorNode(e) {
  return e
    ? exports.hvigorCore.getModuleByScriptPath(
        e.substring(0, e.lastIndexOf("."))
      )
    : exports.hvigorCore.getProject();
}
function getNode(e) {
  const t = e
    ? e.substring(0, e.lastIndexOf("."))
    : exports.hvigorCore.getProject().getBuildFilePath();
  return exports.hvigorCore.getHvigorNodeByScriptPath(t);
}
function getHvigorConfigValue(e) {
  const t = path_1.default.resolve(
    path_const_js_1.HVIGOR_PROJECT_WRAPPER_HOME,
    const_js_1.DEFAULT_HVIGOR_CONFIG_JSON_FILE_NAME
  );
  if (!fs_1.default.existsSync(t)) return !1;
  const r = json5_reader_js_1.Json5Reader.getJson5Obj(t),
    o = json5_reader_js_1.Json5Reader.getJson5ObjProp(r, e);
  if (r && void 0 !== o) return !1 === o;
  {
    const t = path_1.default.resolve(
      path_const_js_2.HVIGOR_USER_HOME,
      const_js_1.DEFAULT_HVIGOR_CONFIG_JSON_FILE_NAME
    );
    if (!fs_1.default.existsSync(t)) return !1;
    const r = json5_reader_js_1.Json5Reader.getJson5Obj(t),
      o = json5_reader_js_1.Json5Reader.getJson5ObjProp(r, e);
    if (r && void 0 !== o) return !1 === o;
  }
  return !1;
}
(exports.getHvigorNode = getHvigorNode),
  (exports.getNode = getNode),
  (exports.getHvigorConfigValue = getHvigorConfigValue),
  (exports.hvigorCore = new HvigorCore());
