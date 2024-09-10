"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.LogServiceImpl=void 0;const report_js_1=require("../../../common/report/report.js"),report_service_impl_js_1=require("../../../common/report/report-service-impl.js"),log_type_js_1=require("../enum/log-type.js"),log_collector_js_1=require("./log-collector.js");class LogServiceImpl{constructor(){this.isActive=!0,this.logCollectorMap=new Map,this.logCollectorMap.set(log_type_js_1.LogType.SCHEDULE,new log_collector_js_1.LogCollector),this.logCollectorMap.set(log_type_js_1.LogType.WORK,new log_collector_js_1.LogCollector),report_service_impl_js_1.ReportServiceImpl.getInstance().addListener(this)}clear(e){var o;e?null===(o=this.logCollectorMap.get(e))||void 0===o||o.clear():this.logCollectorMap.clear()}getLog(e){var o;return null===(o=this.logCollectorMap.get(e))||void 0===o?void 0:o.dump()}addLog(e){var o;this.isActive&&(null===(o=this.logCollectorMap.get(e.type))||void 0===o||o.add(e))}start(){this.isActive=!0}end(){this.isActive=!1}queryReport(){return new report_js_1.Report(`${log_type_js_1.LogType.WORK}Log`,new Set)}}exports.LogServiceImpl=LogServiceImpl;