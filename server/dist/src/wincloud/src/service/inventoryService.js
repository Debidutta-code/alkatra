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
exports.InventoryError = exports.InventoryService = void 0;
const xml2js_1 = require("xml2js");
const xmlbuilder2_1 = require("xmlbuilder2");
const inventoryRepository_1 = require("../repository/inventoryRepository");
// Update InventoryError class
class InventoryError extends Error {
    constructor(errorType, errorMessage, statusCode = 400, response // Add this property
    ) {
        super(errorMessage);
        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.statusCode = statusCode;
        this.response = response;
        Object.setPrototypeOf(this, InventoryError.prototype);
    }
}
exports.InventoryError = InventoryError;
// Similarly update RatePlanError class
class RatePlanError extends Error {
    constructor(errorType, errorMessage, statusCode = 400, response // Add this property
    ) {
        super(errorMessage);
        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.statusCode = statusCode;
        this.response = response;
        Object.setPrototypeOf(this, RatePlanError.prototype);
    }
}
class InventoryService {
    constructor() {
        this.repository = new inventoryRepository_1.InventoryRepository();
    }
    isValidUri(uri) {
        return uri && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(uri);
    }
    validateDates(startDateStr, endDateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        if (isNaN(startDate.getTime())) {
            throw new InventoryError('Invalid Date Format', `Start date format "${startDateStr}" is invalid. Use YYYY-MM-DD.`);
        }
        if (isNaN(endDate.getTime())) {
            throw new InventoryError('Invalid Date Format', `End date format "${endDateStr}" is invalid. Use YYYY-MM-DD.`);
        }
        if (startDate < today) {
            throw new InventoryError('Invalid Start Date', `Start date (${startDateStr}) cannot be older than today.`);
        }
        if (endDate < today) {
            throw new InventoryError('Invalid End Date', `End date (${endDateStr}) cannot be older than today.`);
        }
        if (startDate > endDate) {
            throw new InventoryError('Date Range Error\n', `Start date (${startDateStr}) must be on or before End date (${endDateStr}).`);
        }
    }
    formatErrorResponse(error, echoToken = '20250526090139') {
        const timestamp = new Date().toISOString();
        const xml = (0, xmlbuilder2_1.create)({ version: '1.0', encoding: 'UTF-8' })
            .ele('OTA_HotelInvCountNotifRS', {
            xmlns: 'http://www.opentravel.org/OTA/2003/05',
            'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            EchoToken: echoToken,
            TimeStamp: timestamp,
            Version: '1.0'
        })
            .ele('Errors')
            .ele('Error', {
            Type: error.errorType,
            Code: error.statusCode.toString(),
        })
            .txt(error.errorMessage)
            .up()
            .up()
            .end({ prettyPrint: true });
        return xml;
    }
    formatSuccessResponse(echoToken = '20250526090139') {
        const timestamp = new Date().toISOString();
        const xml = (0, xmlbuilder2_1.create)({ version: '1.0', encoding: 'UTF-8' })
            .ele('OTA_HotelInvCountNotifRS', {
            xmlns: 'http://www.opentravel.org/OTA/2003/05',
            'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            EchoToken: echoToken,
            TimeStamp: timestamp,
            Version: '1.0'
        })
            .ele('Success')
            .up()
            .end({ prettyPrint: true });
        return xml;
    }
    processInventoryXml(xml) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            let echoToken = '20250526090139';
            try {
                const parsed = yield (0, xml2js_1.parseStringPromise)(xml, {
                    explicitArray: false,
                    trim: true,
                    normalize: true,
                });
                const root = parsed['OTA_HotelInvCountNotifRQ'];
                if (!root)
                    throw new InventoryError('XML Structure Error', 'Root element OTA_HotelInvCountNotifRQ is missing');
                if (!root['$'])
                    throw new InventoryError('XML Structure Error', 'Root attributes are missing');
                const rootAttrs = root['$'];
                echoToken = rootAttrs.EchoToken || '20250526090139';
                // const requiredNamespaces = ['xmlns:xsi', 'xmlns:xsd', 'xmlns'];
                // const requiredNamespaces = ['xmlns:xsd', 'xmlns'];
                // for (const ns of requiredNamespaces) {
                //     if (!rootAttrs[ns]) throw new InventoryError('Namespace Missing', `${ns} namespace is required`);
                //     if (!this.isValidUri(rootAttrs[ns])) throw new InventoryError('Invalid Namespace', `${ns} has an invalid URI format: ${rootAttrs[ns]}`);
                // }
                const requiredRootAttrs = ['EchoToken', 'TimeStamp', 'Target', 'Version'];
                for (const attr of requiredRootAttrs) {
                    if (!rootAttrs[attr])
                        throw new InventoryError('Missing Required Attribute', `${attr} is required in root element`);
                }
                if (!root.POS)
                    throw new InventoryError('XML Structure Error', 'POS element is required');
                if (!root.POS.Source)
                    throw new InventoryError('XML Structure Error', 'Source element is missing in POS');
                if (!root.POS.Source.RequestorID)
                    throw new InventoryError('XML Structure Error', 'RequestorID is missing in Source');
                const requestorID = root.POS.Source.RequestorID['$'];
                if (!requestorID)
                    throw new InventoryError('XML Structure Error', 'RequestorID attributes are missing');
                // const requiredRequestorAttrs = ['ID', 'ID_Context', 'MessagePassword'];
                // for (const attr of requiredRequestorAttrs) {
                //     if (!requestorID[attr]) throw new InventoryError('Missing Required Attribute', `${attr} is required in RequestorID`);
                // }
                if (!root.Inventories)
                    throw new InventoryError('XML Structure Error', 'Inventories element is required');
                const inventories = root.Inventories.Inventory;
                if (!inventories)
                    throw new InventoryError('XML Structure Error', 'No Inventory entries found in Inventories');
                const inventoryArray = Array.isArray(inventories) ? inventories : [inventories];
                const results = [];
                for (const inv of inventoryArray) {
                    const hotelCode = (_a = root.Inventories['$']) === null || _a === void 0 ? void 0 : _a.HotelCode;
                    // const hotelName = root.Inventories['$']?.HotelName;
                    const invTypeCode = (_b = inv.StatusApplicationControl['$']) === null || _b === void 0 ? void 0 : _b.InvTypeCode;
                    const startDate = (_c = inv.StatusApplicationControl['$']) === null || _c === void 0 ? void 0 : _c.Start;
                    const endDate = (_d = inv.StatusApplicationControl['$']) === null || _d === void 0 ? void 0 : _d.End;
                    const countStr = (_f = (_e = inv.InvCounts) === null || _e === void 0 ? void 0 : _e.InvCount['$']) === null || _f === void 0 ? void 0 : _f.Count;
                    if (!hotelCode)
                        throw new InventoryError('Missing Required Field', 'HotelCode is required in Inventories');
                    // if (!hotelName) throw new InventoryError('Missing Required Field', 'HotelName is required in Inventories');
                    if (!invTypeCode)
                        throw new InventoryError('Missing Required Field', 'InvTypeCode is required in StatusApplicationControl');
                    if (!startDate)
                        throw new InventoryError('Missing Required Field', 'Start date is required in StatusApplicationControl');
                    if (!endDate)
                        throw new InventoryError('Missing Required Field', 'End date is required in StatusApplicationControl');
                    if (!countStr)
                        throw new InventoryError('Missing Required Field ', 'Count is required in InvCount');
                    if (!/^\d+$/.test(countStr)) {
                        throw new InventoryError('Invalid Count Value', `Count value must be a number`);
                    }
                    const count = Number(countStr);
                    this.validateDates(startDate, endDate);
                    // const data: InventoryData = {
                    //     hotelCode,
                    //     // hotelName,
                    //     invTypeCode,
                    //     startDate,
                    //     endDate,
                    //     count,
                    // };
                    const data = {
                        hotelCode,
                        invTypeCode,
                        availability: {
                            startDate,
                            endDate,
                            count
                        }
                    };
                    const result = yield this.repository.upsertInventory([data]);
                    results.push(result);
                }
                return { response: this.formatSuccessResponse(echoToken), echoToken };
            }
            catch (error) {
                const echoToken = (() => {
                    var _a, _b;
                    try {
                        const parsed = (0, xml2js_1.parseStringPromise)(xml, {
                            explicitArray: false,
                            trim: true,
                            normalize: true,
                        });
                        return ((_b = (_a = parsed['OTA_HotelInvCountNotifRQ']) === null || _a === void 0 ? void 0 : _a['$']) === null || _b === void 0 ? void 0 : _b.EchoToken) || '20250526090139';
                    }
                    catch (_c) {
                        return '20250526090139';
                    }
                })();
                if (error instanceof InventoryError) {
                    return { response: this.formatErrorResponse(error, echoToken), echoToken };
                }
                else if (error instanceof Error) {
                    const invError = new InventoryError('Inventory Processing Failed', error.message || 'Unknown error occurred while processing inventory XML', 500);
                    return { response: this.formatErrorResponse(invError, echoToken), echoToken };
                }
                else {
                    const invError = new InventoryError('Inventory Processing Failed', 'Unexpected error format received', 500);
                    return { response: this.formatErrorResponse(invError, echoToken), echoToken };
                }
            }
        });
    }
}
exports.InventoryService = InventoryService;
//# sourceMappingURL=inventoryService.js.map