import { parseStringPromise } from 'xml2js';
import { InventoryData, OTAHotelInvCountNotifRQ } from '../interface/inventoryInterface';
import { InventoryRepository } from '../repository/inventoryRepository';

class InventoryError extends Error {
  constructor(
    public errorType: string,
    public errorMessage: string,
    public statusCode: number = 400
  ) {
    super(errorMessage);
    Object.setPrototypeOf(this, InventoryError.prototype);
  }

  toJSON() {
    return {
      error: this.errorType,
      message: this.errorMessage,
      statusCode: this.statusCode
    };
  }
}

export class InventoryService {
    private repository: InventoryRepository;

    constructor() {
        this.repository = new InventoryRepository();
    }

    private isValidUri(uri: string): boolean {
        return uri && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(uri);
    }

    private validateDates(startDateStr: string, endDateStr: string): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime())) {
            throw new InventoryError(
                'Invalid Date Format',
                `Start date format "${startDateStr}" is invalid. Use YYYY-MM-DD.`
            );
        }
        if (isNaN(endDate.getTime())) {
            throw new InventoryError(
                'Invalid Date Format',
                `End date format "${endDateStr}" is invalid. Use YYYY-MM-DD.`
            );
        }

        if (startDate < today) {
            throw new InventoryError(
                'Invalid Start Date',
                `Start date (${startDateStr}) cannot be older than today.`
            );
        }
        if (endDate < today) {
            throw new InventoryError(
                'Invalid End Date',
                `End date (${endDateStr}) cannot be older than today.`
            );
        }

        if (startDate > endDate) {
            throw new InventoryError(
                'Date Range Error\n',
                `Start date (${startDateStr}) must be on or before End date (${endDateStr}).`
            );
        }
    }

    async processInventoryXml(xml: string): Promise<any[]> {
        try {
            const parsed: OTAHotelInvCountNotifRQ = await parseStringPromise(xml, {
                explicitArray: false,
                trim: true,
                normalize: true,
            });

            const root = parsed['OTA_HotelInvCountNotifRQ'];
            if (!root) throw new InventoryError('XML Structure Error', 'Root element OTA_HotelInvCountNotifRQ is missing');

            if (!root['$']) throw new InventoryError('XML Structure Error', 'Root attributes are missing');
            const rootAttrs = root['$'];

            const requiredNamespaces = ['xmlns:xsi', 'xmlns:xsd', 'xmlns'];
            for (const ns of requiredNamespaces) {
                if (!rootAttrs[ns]) throw new InventoryError('Namespace Missing', `${ns} namespace is required`);
                if (!this.isValidUri(rootAttrs[ns])) throw new InventoryError('Invalid Namespace', `${ns} has an invalid URI format: ${rootAttrs[ns]}`);
            }

            const requiredRootAttrs = ['EchoToken', 'TimeStamp', 'Target', 'Version'];
            for (const attr of requiredRootAttrs) {
                if (!rootAttrs[attr]) throw new InventoryError('Missing Required Attribute', `${attr} is required in root element`);
            }

            if (!root.POS) throw new InventoryError('XML Structure Error', 'POS element is required');
            if (!root.POS.Source) throw new InventoryError('XML Structure Error', 'Source element is missing in POS');
            if (!root.POS.Source.RequestorID) throw new InventoryError('XML Structure Error', 'RequestorID is missing in Source');

            const requestorID = root.POS.Source.RequestorID['$'];
            if (!requestorID) throw new InventoryError('XML Structure Error', 'RequestorID attributes are missing');

            const requiredRequestorAttrs = ['ID', 'ID_Context', 'MessagePassword'];
            for (const attr of requiredRequestorAttrs) {
                if (!requestorID[attr]) throw new InventoryError('Missing Required Attribute', `${attr} is required in RequestorID`);
            }

            if (!root.Inventories) throw new InventoryError('XML Structure Error', 'Inventories element is required');
            const inventories = root.Inventories.Inventory;
            if (!inventories) throw new InventoryError('XML Structure Error', 'No Inventory entries found in Inventories');

            const inventoryArray = Array.isArray(inventories) ? inventories : [inventories];
            const results: any[] = [];

            for (const inv of inventoryArray) {
                const hotelCode = root.Inventories['$']?.HotelCode;
                const hotelName = root.Inventories['$']?.HotelName;
                const invTypeCode = inv.StatusApplicationControl['$']?.InvTypeCode;
                const startDate = inv.StatusApplicationControl['$']?.Start;
                const endDate = inv.StatusApplicationControl['$']?.End;
                const countStr = inv.InvCounts?.InvCount['$']?.Count;

                if (!hotelCode) throw new InventoryError('Missing Required Field', 'HotelCode is required in Inventories');
                if (!hotelName) throw new InventoryError('Missing Required Field', 'HotelName is required in Inventories');
                if (!invTypeCode) throw new InventoryError('Missing Required Field', 'InvTypeCode is required in StatusApplicationControl');
                if (!startDate) throw new InventoryError('Missing Required Field', 'Start date is required in StatusApplicationControl');
                if (!endDate) throw new InventoryError('Missing Required Field', 'End date is required in StatusApplicationControl');
                if (!countStr) throw new InventoryError('Missing Required Field ', 'Count is required in InvCount');

                if (!/^\d+$/.test(countStr)) {
                    throw new InventoryError(
                        'Invalid Count Value',
                        `Count value must be a number`
                    );
                }
                const count = Number(countStr);

                this.validateDates(startDate, endDate);

                const data: InventoryData = {
                    hotelCode,
                    hotelName,
                    invTypeCode,
                    startDate,
                    endDate,
                    count,
                };

                const result = await this.repository.upsertInventory(data);
                results.push(result);
            }

            return results;
        } catch (error) {
            if (error instanceof InventoryError) {
                throw error;
            } else if (error instanceof Error) {
                throw new InventoryError(
                    'Inventory Processing Failed',
                    error.message || 'Unknown error occurred while processing inventory XML',
                    500
                );
            } else {
                throw new InventoryError(
                    'Inventory Processing Failed',
                    'Unexpected error format received',
                    500
                );
            }
        }
    }
}

export { InventoryError }; 