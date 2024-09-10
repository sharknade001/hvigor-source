"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.MetricFactory = exports.MAIN_THREAD = void 0);
const crypto_1 = __importDefault(require("crypto")),
  continual_event_js_1 = require("./event/continual-event.js"),
  counter_event_js_1 = require("./event/counter-event.js"),
  duration_event_js_1 = require("./event/duration-event.js"),
  gauge_event_js_1 = require("./event/gauge-event.js"),
  instant_event_js_1 = require("./event/instant-event.js"),
  log_event_js_1 = require("./event/log-event.js"),
  mark_event_js_1 = require("./event/mark-event.js"),
  metadata_event_js_1 = require("./event/metadata-event.js"),
  object_event_js_1 = require("./event/object-event.js"),
  metric_service_js_1 = require("./metric-service.js");
exports.MAIN_THREAD = "Main Thread";
class MetricFactory {
  static getUuid() {
    return crypto_1.default.randomUUID();
  }
  static createDurationEvent(e, t, r, n) {
    const s = new duration_event_js_1.DurationEvent(
      MetricFactory.getUuid(),
      e,
      t,
      process.pid,
      r,
      null != n ? n : exports.MAIN_THREAD
    );
    return metric_service_js_1.MetricService.getInstance().submit(s), s;
  }
  static createInstantEvent(e, t, r) {
    const n = new instant_event_js_1.InstantEvent(
      MetricFactory.getUuid(),
      e,
      t,
      process.pid,
      null != r ? r : exports.MAIN_THREAD
    );
    return metric_service_js_1.MetricService.getInstance().submit(n), n;
  }
  static createCounterEvent(e, t, r, n, s) {
    const c = new counter_event_js_1.CounterEvent(
      MetricFactory.getUuid(),
      e,
      t,
      process.pid,
      null != s ? s : exports.MAIN_THREAD,
      r,
      n
    );
    return metric_service_js_1.MetricService.getInstance().submit(c), c;
  }
  static createGaugeEvent(e, t, r, n) {
    const s = new gauge_event_js_1.GaugeEvent(
      MetricFactory.getUuid(),
      e,
      r,
      process.pid,
      null != n ? n : exports.MAIN_THREAD,
      t
    );
    return metric_service_js_1.MetricService.getInstance().submit(s), s;
  }
  static createObjectEvent(e, t, r, n, s, c) {
    const i = new object_event_js_1.ObjectEvent(
      MetricFactory.getUuid(),
      e,
      n,
      process.pid,
      null != c ? c : exports.MAIN_THREAD,
      t,
      r,
      s
    );
    return metric_service_js_1.MetricService.getInstance().submit(i), i;
  }
  static createMetadataEvent(e, t, r, n) {
    const s = new metadata_event_js_1.MetadataEvent(
      MetricFactory.getUuid(),
      e,
      r,
      process.pid,
      null != n ? n : exports.MAIN_THREAD,
      t
    );
    return metric_service_js_1.MetricService.getInstance().submit(s), s;
  }
  static createMarkEvent(e, t, r) {
    const n = new mark_event_js_1.MarkEvent(
      MetricFactory.getUuid(),
      e,
      t,
      process.pid,
      null != r ? r : exports.MAIN_THREAD
    );
    return metric_service_js_1.MetricService.getInstance().submit(n), n;
  }
  static createLogEvent(e, t, r, n) {
    const s = new log_event_js_1.LogEvent(
      MetricFactory.getUuid(),
      e,
      null != n ? n : "",
      process.pid,
      null != r ? r : exports.MAIN_THREAD,
      t
    );
    return metric_service_js_1.MetricService.getInstance().submit(s), s;
  }
  static createContinualEvent(e, t, r, n, s) {
    const c = new continual_event_js_1.ContinualEvent(
      MetricFactory.getUuid(),
      e,
      t,
      process.pid,
      null != s ? s : exports.MAIN_THREAD,
      r,
      n
    );
    return metric_service_js_1.MetricService.getInstance().submit(c), c;
  }
}
exports.MetricFactory = MetricFactory;
