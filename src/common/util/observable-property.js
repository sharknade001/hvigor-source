"use strict";function observe(e,t){return"object"!=typeof e||null===e?e:(Object.keys(e).forEach((r=>{const o=e[r];"object"==typeof o&&(e[r]=createObservableObject(o,t))})),createObservableObject(e,t))}function createObservableObject(e,t){return new Proxy(e,{set:function(e,r,o){return e[r]=o,t(),!0}})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.observe=void 0,exports.observe=observe;