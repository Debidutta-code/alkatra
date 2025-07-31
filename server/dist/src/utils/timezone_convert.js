"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const convertToLocalTime = () => {
    const timezone = process.env.TIMEZONE;
    if (!timezone) {
        throw new Error("The time zone not found. Please set in Environment");
    }
    const currentTimeUTC = new Date();
    // const localTime = moment(currentTimeUTC).tz(timezone); 
    const localTime = (0, moment_timezone_1.default)().tz("Asia/Kolkata").toDate();
    // if (!localTime.isValid()) {
    //   throw new Error ("Can't convert to local time zone");
    // }
    // return localTime.toDate();
    return localTime;
};
exports.default = convertToLocalTime;
//# sourceMappingURL=timezone_convert.js.map