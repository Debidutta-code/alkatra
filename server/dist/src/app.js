"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const bodyParser = require('body-parser');
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: ["http://alhajz.ai"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
    credentials: true,
}));
// Increase the payload size limit
exports.app.use(bodyParser.json({ limit: '50mb' }));
exports.app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use(express_1.default.static("public"));
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use(express_1.default.json({ limit: '50mb' }));
exports.app.options("*", (0, cors_1.default)());
//# sourceMappingURL=app.js.map