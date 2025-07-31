"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.config = void 0;
var env_variable_1 = require("./env.variable");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return env_variable_1.config; } });
var s3_config_1 = require("./s3.config");
Object.defineProperty(exports, "s3Client", { enumerable: true, get: function () { return s3_config_1.s3Client; } });
//# sourceMappingURL=index.js.map