"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const index_1 = __importDefault(require("./common/index"));
const app_1 = require("./app");
const express_1 = require("./common/express");
const node_cron_1 = __importDefault(require("node-cron"));
const cryptoPayment_model_1 = __importDefault(require("./booking_engine/src/models/cryptoPayment.model"));
const passport_1 = __importDefault(require("passport"));
const cryptoUserPaymentInitialStage_model_1 = require("./booking_engine/src/models/cryptoUserPaymentInitialStage.model");
// Middleware
app_1.app.use(passport_1.default.initialize());
(0, express_1.initializeExpressRoutes)({ app: app_1.app }).then(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, mongoose_1.connect)(process.env.EXTRANET_MONGO_URI_TESTING);
        console.log(`🏡 Database successfully running on ${connection.connection.host}`);
        app_1.app.listen(index_1.default.port, () => {
            console.log(`🏡 Server is running on port ${index_1.default.port}`);
        });
    }
    catch (err) {
        console.log(`Error: ${err}`);
    }
}));
// CORN job implemented to auto cancel
node_cron_1.default.schedule("*/1 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);
        const cryptoPaymentDetails = yield cryptoPayment_model_1.default.updateMany({
            status: "Pending",
            createdAt: { $lte: fortyMinutesAgo }
        }, {
            $set: { status: "Cancelled" }
        });
        const cryptoGuestDetails = yield cryptoUserPaymentInitialStage_model_1.CryptoGuestDetails.updateMany({
            status: "Processing",
            createdAt: { $lte: fortyMinutesAgo }
        }, {
            $set: { status: "Cancelled" }
        });
        console.log("--------***-----------");
        if (cryptoPaymentDetails.modifiedCount > 0) {
            console.log(`[AUTO-CANCEL] ${cryptoPaymentDetails.modifiedCount} pending payments marked as Cancelled.`);
        }
        if (cryptoGuestDetails.modifiedCount > 0) {
            console.log(`[AUTO-CANCEL] ${cryptoGuestDetails.modifiedCount} processing guest details initiated payments marked as Cancelled.`);
        }
        console.log("--------***-----------");
    }
    catch (error) {
        console.error("[AUTO-CANCEL ERROR]", error);
    }
}));
//# sourceMappingURL=index.js.map