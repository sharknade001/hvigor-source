"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.encodings=void 0;const dbcs_codec_js_1=require("./dbcs-codec.js"),internal_js_1=require("./internal.js");exports.encodings={...internal_js_1.InternalEncoding,...dbcs_codec_js_1.DBCSEncoding};