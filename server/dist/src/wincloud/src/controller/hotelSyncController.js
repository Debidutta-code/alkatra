"use strict";
// import { InventoryService, InventoryError } from "../service/inventoryService";
// import { RatePlanError, RatePlanService } from "../service/ratePlanService";
// import { Request, Response } from 'express';
// import { parseStringPromise } from 'xml2js';
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
exports.HotelSyncController = void 0;
// export class HotelSyncController {
//     private inventoryService: InventoryService;
//     private ratePlanService: RatePlanService;
//     constructor() {
//         this.inventoryService = new InventoryService();
//         this.ratePlanService = new RatePlanService();
//     }
//     async handleHotelSyncUpdate(req: Request, res: Response): Promise<void> {
//         try {
//             const xml = req.body;
//             if (!xml || typeof xml !== 'string') {
//                 res.status(400).json({ error: 'Invalid XML payload' });
//                 return;
//             }
//             const parsedXml = await parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });
//             const rootElement = Object.keys(parsedXml)[0];
//             if (rootElement === 'OTA_HotelInvCountNotifRQ') {
//                 const inventories = await this.inventoryService.processInventoryXml(xml);
//                 const responsePayload = { 
//                     message: 'Inventory updated successfully',
//                     inventories 
//                 };
//                 res.status(200).json(responsePayload);
//             } else if (rootElement === 'OTA_HotelRateAmountNotifRQ') {
//                 const rateAmounts = await this.ratePlanService.processRateAmountXml(xml);
//                 const responsePayload = { 
//                     message: 'Rate amount updated successfully',
//                     rateAmounts 
//                 };
//                 res.status(200).json(responsePayload);
//             } else {
//                 res.status(400).json({ error: 'Unsupported XML request type' });
//             }
//         } catch (error: any) {
//             if (error instanceof InventoryError) {
//                 res.status(error.statusCode).json({
//                     error: 'Failed to process inventory XML',
//                     message: error.errorMessage
//                 });
//             } else if (error instanceof RatePlanError) {
//                 res.status(error.statusCode).json({
//                     error: 'Internal Server Error',
//                     message: error.errorMessage || 'Something went wrong'
//                 });
//             }
//         }
//     }
// }
const inventoryService_1 = require("../service/inventoryService");
const ratePlanService_1 = require("../service/ratePlanService");
const xml2js_1 = require("xml2js");
class HotelSyncController {
    constructor() {
        this.inventoryService = new inventoryService_1.InventoryService();
        this.ratePlanService = new ratePlanService_1.RatePlanService();
    }
    handleHotelSyncUpdate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log('Received request for hotel sync update');
            try {
                const xml = req.body;
                if (!xml || typeof xml !== 'string') {
                    // Default error response for invalid payload
                    const timeStamp = new Date().toISOString().slice(0, 19); // Format: 2025-06-19T07:39:41
                    res.status(400).set('Content-Type', 'application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
                    <OTA_HotelInvCountNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" EchoToken="unknown" TimeStamp="${timeStamp}" Version="1.0">
                        <Errors>
                            <Error Type="InvalidPayload" ShortText="Invalid XML payload"/>
                        </Errors>
                    </OTA_HotelInvCountNotifRS>`);
                    return;
                }
                const parsedXml = yield (0, xml2js_1.parseStringPromise)(xml, { explicitArray: false, mergeAttrs: true });
                const rootElement = Object.keys(parsedXml)[0];
                const echoToken = ((_a = parsedXml[rootElement]) === null || _a === void 0 ? void 0 : _a.EchoToken) || 'unknown';
                const timeStamp = new Date().toISOString().slice(0, 19); // Format: 2025-06-19T07:39:41
                if (rootElement === 'OTA_HotelInvCountNotifRQ') {
                    const result = yield this.inventoryService.processInventoryXml(xml);
                    res.status(200).set('Content-Type', 'application/xml').send(result.response || result);
                }
                else if (rootElement === 'OTA_HotelRateAmountNotifRQ') {
                    const result = yield this.ratePlanService.processRateAmountXml(xml);
                    // Success response for rate plans
                    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                    <OTA_HotelRateAmountNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" EchoToken="${echoToken}" TimeStamp="${timeStamp}" Version="1.0">
                        <Success/>
                    </OTA_HotelRateAmountNotifRS>`;
                    res.status(200).set('Content-Type', 'application/xml').send(xmlResponse);
                }
                else {
                    // Error for unsupported XML type
                    res.status(400).set('Content-Type', 'application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
                    <OTA_HotelInvCountNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" EchoToken="${echoToken}" TimeStamp="${timeStamp}" Version="1.0">
                        <Errors>
                            <Error Type="UnsupportedRequest" ShortText="Unsupported XML request type"/>
                        </Errors>
                    </OTA_HotelInvCountNotifRS>`);
                }
            }
            catch (error) {
                const timeStamp = new Date().toISOString().slice(0, 19); // Format: 2025-06-19T07:39:41
                let echoToken = 'unknown';
                let statusCode = 500;
                let errorType = 'UnknownError';
                let errorMessage = error.message || 'Internal Server Error';
                // Try to extract EchoToken from the request body if available
                try {
                    const xml = req.body;
                    if (xml && typeof xml === 'string') {
                        const parsedXml = yield (0, xml2js_1.parseStringPromise)(xml, { explicitArray: false, mergeAttrs: true });
                        const rootElement = Object.keys(parsedXml)[0];
                        echoToken = ((_b = parsedXml[rootElement]) === null || _b === void 0 ? void 0 : _b.EchoToken) || 'unknown';
                    }
                }
                catch (parseError) {
                    // Ignore parsing errors for EchoToken extraction
                }
                if (error instanceof inventoryService_1.InventoryError || error instanceof ratePlanService_1.RatePlanError) {
                    statusCode = error.statusCode || 400;
                    errorType = error.errorType || 'ProcessingError';
                    errorMessage = error.errorMessage;
                }
                // Determine the response root element based on the request type
                let responseRoot = 'OTA_HotelInvCountNotifRS';
                try {
                    const xml = req.body;
                    if (xml && typeof xml === 'string') {
                        const parsedXml = yield (0, xml2js_1.parseStringPromise)(xml, { explicitArray: false, mergeAttrs: true });
                        if (Object.keys(parsedXml)[0] === 'OTA_HotelRateAmountNotifRQ') {
                            responseRoot = 'OTA_HotelRateAmountNotifRS';
                        }
                    }
                }
                catch (parseError) {
                    // Default to OTA_HotelInvCountNotifRS if parsing fails
                }
                // Send error response
                res.status(statusCode).set('Content-Type', 'application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
                <${responseRoot} xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" EchoToken="${echoToken}" TimeStamp="${timeStamp}" Version="1.0">
                    <Errors>
                        <Error Type="${errorType}" ShortText="${errorMessage.replace(/"/g, '&quot;')}"/>
                    </Errors>
                </${responseRoot}>`);
            }
        });
    }
}
exports.HotelSyncController = HotelSyncController;
//# sourceMappingURL=hotelSyncController.js.map