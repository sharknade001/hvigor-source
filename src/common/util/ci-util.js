"use strict";function isCI(){return!("false"===process.env.CI||!(process.env.BUILD_ID||process.env.BUILD_NUMBER||process.env.CI||process.env.CI_APP_ID||process.env.CI_BUILD_ID||process.env.CI_BUILD_NUMBER||process.env.CI_NAME||process.env.CONTINUOUS_INTEGRATION||process.env.RUN_ID||exports.name))}Object.defineProperty(exports,"__esModule",{value:!0}),exports.isCI=void 0,exports.isCI=isCI;