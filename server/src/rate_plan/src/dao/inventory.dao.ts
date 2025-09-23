import { Inventory } from "../../../wincloud/src/model/inventoryModel";
import { BulkWriteResult } from "mongodb";

interface InventoryUpdateResult {
    success: boolean;
    matchedCount: number;
    modifiedCount: number;
    roomTypesProcessed: number;
    datesProcessed: number;
    totalOperations: number;
    details?: {
        roomType: string;
        date: string;
        status: string;
        action: 'updated' | 'skipped' | 'error';
        reason?: string;
        error?: string;
    }[];
}

export class InventoryDao {
    private static instance: InventoryDao;

    private constructor() { }

    static getInstance(): InventoryDao {
        if (!InventoryDao.instance) {
            InventoryDao.instance = new InventoryDao();
        }
        return InventoryDao.instance;
    }

    async inventoryUpdate(
        hotelCode: string,
        invTypeCode: string[],
        dateStatusList: { date: string; status: string }[]
    ): Promise<InventoryUpdateResult> {

        // Step 1: Input Validation
        const validationError = this.validateInputs(hotelCode, invTypeCode, dateStatusList);
        if (validationError) {
            throw new Error(validationError);
        }

        // Step 2: Normalize and prepare data
        const normalizedHotelCode = hotelCode.trim();
        const normalizedRoomTypes = this.normalizeRoomTypes(invTypeCode);
        const normalizedDateStatusList = this.normalizeDateStatusList(dateStatusList);

        if (normalizedRoomTypes.length === 0) {
            throw new Error("No valid room types provided after normalization");
        }

        try {
            // Step 3: Create bulk operations
            const { bulkOperations, operationDetails } = this.createBulkOperations(
                normalizedHotelCode,
                normalizedRoomTypes,
                normalizedDateStatusList
            );

            if (bulkOperations.length === 0) {
                return this.createEmptyResult(normalizedRoomTypes.length, normalizedDateStatusList.length);
            }

            console.log(`Executing ${bulkOperations.length} bulk operations for ${normalizedRoomTypes.length} room types and ${normalizedDateStatusList.length} dates`);

            // Step 4: Execute bulk operations
            const bulkResult = await Inventory.bulkWrite(bulkOperations, {
                ordered: false,
                writeConcern: { w: 'majority' }
            });

            console.log(`Bulk write completed - Matched: ${bulkResult.matchedCount}, Modified: ${bulkResult.modifiedCount}`);

            // Step 5: Prepare detailed response
            return this.createSuccessResult(
                bulkResult,
                normalizedRoomTypes.length,
                normalizedDateStatusList.length,
                bulkOperations.length,
                operationDetails
            );

        } catch (error) {
            console.error("Error in inventoryUpdate DAO:", error);
            throw new Error(`Inventory update failed: ${error.message}`);
        }
    }

    /**
     * Validate all input parameters
     */
    private validateInputs(
        hotelCode: string,
        invTypeCode: string[],
        dateStatusList: { date: string; status: string }[]
    ): string | null {

        if (!hotelCode || !hotelCode.trim()) {
            return "Hotel code is required and cannot be empty";
        }

        if (!Array.isArray(invTypeCode) || invTypeCode.length === 0) {
            return "Room Type code must be a non-empty array";
        }

        if (!Array.isArray(dateStatusList) || dateStatusList.length === 0) {
            return "dateStatusList must be a non-empty array";
        }

        // Validate each room type
        for (const roomType of invTypeCode) {
            if (!roomType || !roomType.toString().trim()) {
                return "All room types must be non-empty strings";
            }
        }

        // Validate each date-status item
        for (const item of dateStatusList) {
            if (!item.date || !item.date.toString().trim()) {
                return "Date is required for each item in dateStatusList";
            }

            if (!item.status || !['open', 'close'].includes(item.status)) {
                return "Each item must have a valid status ('open' or 'close')";
            }

            // Validate date format
            const date = new Date(item.date);
            if (isNaN(date.getTime())) {
                return `Invalid date format for ${item.date}`;
            }

            // Validate date is not in the past (optional business logic)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                return `Cannot update inventory for past date: ${item.date}`;
            }
        }

        return null;
    }

    /**
     * Normalize room types - remove duplicates, trim, filter empty values
     */
    private normalizeRoomTypes(roomTypes: string[]): string[] {
        return [...new Set(roomTypes
            .map(rt => rt.toString().trim())
            .filter(rt => rt.length > 0)
        )];
    }

    /**
     * Normalize date-status list - validate dates, remove duplicates
     */
    private normalizeDateStatusList(dateStatusList: { date: string; status: string }[]): { date: string; status: string }[] {
        const uniqueMap = new Map<string, { date: string; status: string }>();

        for (const item of dateStatusList) {
            const date = new Date(item.date);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Keep the last occurrence for duplicate dates
            uniqueMap.set(dateKey, {
                date: dateKey,
                status: item.status
            });
        }

        return Array.from(uniqueMap.values());
    }

    /**
     * Create bulk operations for MongoDB
     */
    private createBulkOperations(
        hotelCode: string,
        roomTypes: string[],
        dateStatusList: { date: string; status: string }[]
    ): { bulkOperations: any[]; operationDetails: any[] } {

        const bulkOperations = [];
        const operationDetails = [];
        const processedCombinations = new Set<string>();

        for (const roomType of roomTypes) {
            for (const { date, status } of dateStatusList) {
                const combinationKey = `${hotelCode}-${roomType}-${date}`;

                // Avoid duplicate operations
                if (processedCombinations.has(combinationKey)) {
                    continue;
                }
                processedCombinations.add(combinationKey);

                const startDate = new Date(date);

                bulkOperations.push({
                    updateOne: {
                        filter: {
                            hotelCode: hotelCode,
                            invTypeCode: roomType,
                            "availability.startDate": startDate,
                        },
                        update: {
                            $set: {
                                status: status,
                                updatedAt: new Date(),
                            },
                        },
                    }
                });

                operationDetails.push({
                    roomType,
                    date,
                    status,
                    combinationKey
                });
            }
        }

        return { bulkOperations, operationDetails };
    }

    /**
     * Create empty result when no operations to perform
     */
    private createEmptyResult(roomTypesCount: number, datesCount: number): InventoryUpdateResult {
        return {
            success: true,
            matchedCount: 0,
            modifiedCount: 0,
            roomTypesProcessed: roomTypesCount,
            datesProcessed: datesCount,
            totalOperations: 0,
            details: []
        };
    }

    /**
     * Create success result after bulk operations
     */
    private createSuccessResult(
        bulkResult: any,
        roomTypesCount: number,
        datesCount: number,
        totalOperations: number,
        operationDetails: any[]
    ): InventoryUpdateResult {

        return {
            success: true,
            matchedCount: bulkResult.matchedCount || 0,
            modifiedCount: bulkResult.modifiedCount || 0,
            roomTypesProcessed: roomTypesCount,
            datesProcessed: datesCount,
            totalOperations: totalOperations,
            details: operationDetails.map(detail => ({
                roomType: detail.roomType,
                date: detail.date,
                status: detail.status,
                action: 'updated', // In bulk operations, we assume all were attempted
                reason: 'bulk_operation'
            }))
        };
    }

    /**
     * Alternative method: Find and update each document individually for more control
     */
    async inventoryUpdateWithDetailedResults(
        hotelCode: string,
        invTypeCode: string[],
        dateStatusList: { date: string; status: string }[]
    ): Promise<InventoryUpdateResult> {

        // Same validation as above
        const validationError = this.validateInputs(hotelCode, invTypeCode, dateStatusList);
        if (validationError) {
            throw new Error(validationError);
        }

        const normalizedHotelCode = hotelCode.trim();
        const normalizedRoomTypes = this.normalizeRoomTypes(invTypeCode);
        const normalizedDateStatusList = this.normalizeDateStatusList(dateStatusList);

        const details = [];
        let matchedCount = 0;
        let modifiedCount = 0;

        try {
            for (const roomType of normalizedRoomTypes) {
                for (const { date, status } of normalizedDateStatusList) {
                    try {
                        const startDate = new Date(date);

                        const result = await Inventory.updateOne(
                            {
                                hotelCode: normalizedHotelCode,
                                invTypeCode: roomType,
                                "availability.startDate": startDate,
                            },
                            {
                                $set: {
                                    status: status,
                                    updatedAt: new Date(),
                                },
                            }
                        );

                        if (result.matchedCount > 0) {
                            matchedCount++;

                            if (result.modifiedCount > 0) {
                                modifiedCount++;
                                details.push({
                                    roomType,
                                    date,
                                    status,
                                    action: 'updated' as const,
                                    reason: 'success'
                                });
                            } else {
                                details.push({
                                    roomType,
                                    date,
                                    status,
                                    action: 'skipped' as const,
                                    reason: 'no_change_needed'
                                });
                            }
                        } else {
                            details.push({
                                roomType,
                                date,
                                status,
                                action: 'skipped' as const,
                                reason: 'document_not_found'
                            });
                        }

                    } catch (error) {
                        console.error(`Error updating roomType: ${roomType}, date: ${date}`, error);
                        details.push({
                            roomType,
                            date,
                            status,
                            action: 'error' as const,
                            reason: 'update_failed',
                            error: error.message
                        });
                    }
                }
            }

            return {
                success: true,
                matchedCount,
                modifiedCount,
                roomTypesProcessed: normalizedRoomTypes.length,
                datesProcessed: normalizedDateStatusList.length,
                totalOperations: normalizedRoomTypes.length * normalizedDateStatusList.length,
                details
            };

        } catch (error) {
            console.error("Error in inventoryUpdateWithDetailedResults:", error);
            throw new Error(`Detailed inventory update failed: ${error.message}`);
        }
    }
}