"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.projectTaskDag=exports.TaskDirectedAcyclicGraph=void 0;const multi_map_js_1=require("../../../../common/util/multi-map.js");class TaskDirectedAcyclicGraph{constructor(){this._out=new multi_map_js_1.MultiMap,this._in=new multi_map_js_1.MultiMap}addNode(e){this._out.put(e),this._in.put(e)}addEdge(e,t){return this._out.put(e,t),this._out.put(t),this._in.put(t,e),this._in.put(e),!0}_hasEdge(e,t){if(e===t)return!0;const r=this._out.get(e);for(const e of r)if(this._hasEdge(e,t))return!0;return!1}removeNode(e){const t=this._out.removeAll(e);for(const r of t)this._in.remove(r,e);const r=this._in.removeAll(e);for(const t of r)this._out.remove(t,e)}clear(){this._out.clear(),this._in.clear()}getChildren(e){return this._out.get(e)}getParent(e){return this._in.get(e)}getAllStartNodes(){return this.findAllZeroEdgeNodes(this._in)}getAllEndNodes(){return this.findAllZeroEdgeNodes(this._out)}checkCircle(){const e=new Set,t=new Set,r=this.getAllStartNodes(),s={};for(const i of r.values())if(this.dfsCircleCheck(i,e,t,s))return{hasCircle:!0,circlePath:[...t,s.node]};return{hasCircle:!1,circlePath:[]}}dfsCircleCheck(e,t,r,s){if(r.has(e))return s.node=e,!0;if(t.has(e))return!1;t.add(e),r.add(e);for(const i of this.getChildren(e))if(this.dfsCircleCheck(i,t,r,s))return!0;return r.delete(e),!1}findAllZeroEdgeNodes(e){const t=new Set;return e.keys().forEach((r=>{0===e.get(r).size&&t.add(r)})),t}}exports.TaskDirectedAcyclicGraph=TaskDirectedAcyclicGraph,exports.projectTaskDag=new TaskDirectedAcyclicGraph;