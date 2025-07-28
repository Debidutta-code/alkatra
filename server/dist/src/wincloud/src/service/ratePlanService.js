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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatePlanError = exports.RatePlanService = void 0;
const xml2js_1 = require("xml2js");
const ratePlanRepository_1 = require("../repository/ratePlanRepository");
class RatePlanError extends Error {
    constructor(errorType, errorMessage, statusCode = 400) {
        super(errorMessage);
        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, RatePlanError.prototype);
    }
    toJSON() {
        return {
            error: this.errorType,
            message: this.errorMessage,
            statusCode: this.statusCode
        };
    }
}
exports.RatePlanError = RatePlanError;
class RatePlanService {
    constructor() {
        this.repository = new ratePlanRepository_1.RatePlanRepository();
    }
    validateDates(startDateStr, endDateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        if (isNaN(startDate.getTime())) {
            throw new RatePlanError('Invalid Date Format', `Start date format "${startDateStr}" is invalid. Use YYYY-MM-DD.`);
        }
        if (isNaN(endDate.getTime())) {
            throw new RatePlanError('Invalid Date Format', `End date format "${endDateStr}" is invalid. Use YYYY-MM-DD.`);
        }
        if (startDate < today) {
            throw new RatePlanError('Invalid Start Date', `Start date (${startDateStr}) cannot be older than today.`);
        }
        if (endDate < today) {
            throw new RatePlanError('Invalid End Date', `End date (${endDateStr}) cannot be older than today.`);
        }
        if (startDate > endDate) {
            throw new RatePlanError('Date Range Error', `Start date (${startDateStr}) must be on or before End date (${endDateStr}).`);
        }
    }
    validateRateDays(days) {
        if (!days.mon && !days.tue && !days.wed && !days.thu && !days.fri && !days.sat && !days.sun) {
            throw new RatePlanError('Invalid Rate Days', 'At least one day must be selected for the rate');
        }
    }
    processRateAmountXml(xml) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            console.log('Processing Rate Amount XML');
            try {
                const parsed = yield (0, xml2js_1.parseStringPromise)(xml, {
                    explicitArray: false,
                    trim: true,
                    tagNameProcessors: [(name) => name.replace(/^.*?:/, '')],
                });
                const root = parsed.OTA_HotelRateAmountNotifRQ;
                if (!root)
                    throw new RatePlanError('XML Structure Error', 'Root element OTA_HotelRateAmountNotifRQ is missing');
                if (!root['$'])
                    throw new RatePlanError('XML Structure Error', 'Root attributes are missing');
                const rootAttrs = root['$'];
                const requiredRootAttrs = ['EchoToken', 'TimeStamp', 'Target', 'Version'];
                for (const attr of requiredRootAttrs) {
                    if (!rootAttrs[attr])
                        throw new RatePlanError('Missing Required Attribute', `${attr} is required in root element`);
                }
                if (!root.POS)
                    throw new RatePlanError('XML Structure Error', 'POS element is required');
                if (!root.POS.Source)
                    throw new RatePlanError('XML Structure Error', 'Source element is missing in POS');
                if (!root.POS.Source.RequestorID)
                    throw new RatePlanError('XML Structure Error', 'RequestorID is missing in Source');
                const requestorID = root.POS.Source.RequestorID['$'];
                if (!requestorID)
                    throw new RatePlanError('XML Structure Error', 'RequestorID attributes are missing');
                const requiredRequestorAttrs = ['ID', 'ID_Context', 'MessagePassword'];
                for (const attr of requiredRequestorAttrs) {
                    if (!requestorID[attr])
                        throw new RatePlanError('Missing Required Attribute', `${attr} is required in RequestorID`);
                }
                if (!root.RateAmountMessages)
                    throw new RatePlanError('XML Structure Error', 'RateAmountMessages element is required');
                const rateAmountMessages = root.RateAmountMessages.RateAmountMessage;
                if (!rateAmountMessages)
                    throw new RatePlanError('XML Structure Error', 'RateAmountMessage element is missing in RateAmountMessages');
                const messageArray = Array.isArray(rateAmountMessages) ? rateAmountMessages : [rateAmountMessages];
                const allRatePlans = [];
                for (const message of messageArray) {
                    if (!message.StatusApplicationControl)
                        throw new RatePlanError('XML Structure Error', 'StatusApplicationControl is missing in RateAmountMessage');
                    if (!message.Rates)
                        throw new RatePlanError('XML Structure Error', 'Rates element is missing in RateAmountMessage');
                    if (!message.Rates.Rate)
                        throw new RatePlanError('XML Structure Error', 'Rate element is missing in Rates');
                    const statusControl = message.StatusApplicationControl['$'];
                    if (!statusControl)
                        throw new RatePlanError('XML Structure Error', 'StatusApplicationControl attributes are missing');
                    const requiredStatusAttrs = ['InvTypeCode', 'RatePlanCode', 'Start', 'End'];
                    for (const attr of requiredStatusAttrs) {
                        if (!statusControl[attr])
                            throw new RatePlanError('Missing Required Attribute', `${attr} is required in StatusApplicationControl`);
                    }
                    const rateAttrs = message.Rates.Rate['$'];
                    if (!rateAttrs)
                        throw new RatePlanError('XML Structure Error', 'Rate attributes are missing');
                    if (!rateAttrs.CurrencyCode)
                        throw new RatePlanError('Missing Required Field', 'CurrencyCode is required in Rate');
                    const data = {
                        hotelCode: (_a = root.RateAmountMessages['$']) === null || _a === void 0 ? void 0 : _a.HotelCode,
                        hotelName: (_b = root.RateAmountMessages['$']) === null || _b === void 0 ? void 0 : _b.HotelName,
                        invTypeCode: statusControl.InvTypeCode,
                        ratePlanCode: statusControl.RatePlanCode,
                        startDate: statusControl.Start,
                        endDate: statusControl.End,
                        days: {
                            mon: rateAttrs.Mon === 'true',
                            tue: rateAttrs.Tue === 'true',
                            wed: rateAttrs.Weds === 'true',
                            thu: rateAttrs.Thur === 'true',
                            fri: rateAttrs.Fri === 'true',
                            sat: rateAttrs.Sat === 'true',
                            sun: rateAttrs.Sun === 'true',
                        },
                        currencyCode: rateAttrs.CurrencyCode,
                        baseByGuestAmts: ((_c = message.Rates.Rate.BaseByGuestAmts) === null || _c === void 0 ? void 0 : _c.BaseByGuestAmt)
                            ? (Array.isArray(message.Rates.Rate.BaseByGuestAmts.BaseByGuestAmt)
                                ? message.Rates.Rate.BaseByGuestAmts.BaseByGuestAmt
                                : [message.Rates.Rate.BaseByGuestAmts.BaseByGuestAmt]).map(amt => {
                                const amtAttrs = amt['$'];
                                if (!amtAttrs)
                                    throw new RatePlanError('XML Structure Error', 'BaseByGuestAmt attributes are missing');
                                if (!amtAttrs.AmountBeforeTax)
                                    throw new RatePlanError('Missing Required Field', 'AmountBeforeTax is required in BaseByGuestAmt');
                                if (!amtAttrs.NumberOfGuests)
                                    throw new RatePlanError('Missing Required Field', 'NumberOfGuests is required in BaseByGuestAmt');
                                const amount = parseFloat(amtAttrs.AmountBeforeTax);
                                if (isNaN(amount))
                                    throw new RatePlanError('Invalid Value', 'AmountBeforeTax must be a valid number');
                                const guests = parseInt(amtAttrs.NumberOfGuests, 10);
                                if (isNaN(guests))
                                    throw new RatePlanError('Invalid Value', 'NumberOfGuests must be a valid integer');
                                return {
                                    amountBeforeTax: amount,
                                    numberOfGuests: guests,
                                };
                            })
                            : [],
                        additionalGuestAmounts: ((_d = message.Rates.Rate.AdditionalGuestAmounts) === null || _d === void 0 ? void 0 : _d.AdditionalGuestAmount)
                            ? (Array.isArray(message.Rates.Rate.AdditionalGuestAmounts.AdditionalGuestAmount)
                                ? message.Rates.Rate.AdditionalGuestAmounts.AdditionalGuestAmount
                                : [message.Rates.Rate.AdditionalGuestAmounts.AdditionalGuestAmount]).map(amt => {
                                const amtAttrs = amt['$'];
                                if (!amtAttrs)
                                    throw new RatePlanError('XML Structure Error', 'AdditionalGuestAmount attributes are missing');
                                if (!amtAttrs.AgeQualifyingCode)
                                    throw new RatePlanError('Missing Required Field', 'AgeQualifyingCode is required in AdditionalGuestAmount');
                                if (!amtAttrs.Amount)
                                    throw new RatePlanError('Missing Required Field', 'Amount is required in AdditionalGuestAmount');
                                const amount = parseFloat(amtAttrs.Amount);
                                if (isNaN(amount))
                                    throw new RatePlanError('Invalid Value', 'Amount must be a valid number');
                                return {
                                    ageQualifyingCode: amtAttrs.AgeQualifyingCode,
                                    amount: amount,
                                };
                            })
                            : [],
                    };
                    this.validateDates(data.startDate, data.endDate);
                    this.validateRateDays(data.days);
                    console.log('Validated Rate Plan Data:', data);
                    allRatePlans.push(data); // Add the data to allRatePlans
                }
                const upsertResult = yield this.repository.upsertRateAmount(allRatePlans); // Perform upsert after collecting all data
                console.log('Upserted Rate Plan Data:', upsertResult);
                return upsertResult;
            }
            catch (error) {
                if (error instanceof RatePlanError) {
                    throw error;
                }
                else if (error instanceof Error) {
                    throw new RatePlanError('Rate Plan Processing Failed', error.message || 'Unknown error occurred while processing rate plan XML', 500);
                }
                else {
                    throw new RatePlanError('Rate Plan Processing Failed', 'Unexpected error format received', 500);
                }
            }
        });
    }
}
exports.RatePlanService = RatePlanService;
//# sourceMappingURL=ratePlanService.js.map