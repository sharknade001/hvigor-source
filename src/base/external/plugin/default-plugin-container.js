"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.DefaultPluginContainer = void 0);
const hvigor_log_js_1 = require("../../log/hvigor-log.js"),
  log = hvigor_log_js_1.HvigorLogger.getLogger("hvigor-plugin-container");
class DefaultPluginContainer {
  constructor() {
    this._pluginMap = new Map();
  }
  registryPlugin(e) {
    const g = e.getPluginId();
    return (
      this._pluginMap.has(g) &&
        log.errorMessageExit(
          `Plugin with ID ${g} has been registered. Please check.`
        ),
      this._pluginMap.set(g, e),
      e
    );
  }
  getPluginById(e) {
    return this._pluginMap.get(e);
  }
}
exports.DefaultPluginContainer = DefaultPluginContainer;
