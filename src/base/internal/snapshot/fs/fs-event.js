"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.FsEvent=void 0;class FsEvent{constructor(t,e,s,r){this.eventType=t,this.name=e,this.file=s,this.stats=r}getName(){return this.name}type(){return this.eventType}getFile(){return this.file}getStats(){return this.stats}}exports.FsEvent=FsEvent;