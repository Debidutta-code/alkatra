import { Inventory } from '../../../wincloud/src/model/inventoryModel';
import { RateAmount } from '../../../wincloud/src/model/ratePlanModel';
import { PropertyInfo } from '../model/property.info.model';
import { RatePlanDataDateWise } from '../interface';
import { Room } from '../model/room.model';
import RateAmountDateWise, { IRateAmountDateWise } from '../../../wincloud/src/model/ratePlanDateWise.model';


export class RatePlanRepository {

    /**
     * Singleton instance of the RatePlanRepository
     */
    private static instance: RatePlanRepository

    /**
     * Private constructor to prevent direct instantiation
     */
    private constructor() { }

    /**
     * Get the singleton instance of the RatePlanRepository
     * @returns Singleton instance of the RatePlanRepository
     */
    static getInstance(): RatePlanRepository {
        if (!RatePlanRepository.instance) {
            RatePlanRepository.instance = new RatePlanRepository()
        }
        return RatePlanRepository.instance
    }

    /**
     * Getting Hotel Name by hotelCode
     * @param hotelCode 
     * @returns 
     */
    async getHotelName(hotelCode: string) {
        return await PropertyInfo.findOne({ property_code: hotelCode }).select('property_name');
    }

    /**
     * Checking Inventory Type Code
     * @param invTypeCode 
     * @returns 
     */
    async checkInvTypeCode(invTypeCode: string) {
        return await Room.findOne({ room_type: invTypeCode }).select('room_type');
    }

    /**
     * Finding existing Rate Plan by hotelCode and invTypeCode
     * @param hotelCode 
     * @param invTypeCode 
     * @returns 
     */
    async ratePlanFind(hotelCode: string, invTypeCode: string) {
        const ratePlanData1 = await RateAmount.findOne({ hotelCode, invTypeCode });
        if (ratePlanData1) {
            return ratePlanData1;
        }
        const ratePlanData2 = await Inventory.findOne({ hotelCode, invTypeCode });
        if (ratePlanData2) {
            return ratePlanData2;
        }

    }


    /**
     * Creating new Rate Plan
     * @param data
     * @returns
     */
    async ratePlanCreate(data: any) {
        const newRatePlan = new RateAmount({
            hotelCode: data.hotelCode,
            hotelName: data.hotelName,
            invTypeCode: data.invTypeCode,
            ratePlanCode: data.ratePlanCode,
            startDate: data.startDate,
            endDate: data.endDate,
            days: data.days,
            currencyCode: data.currencyCode,
            baseByGuestAmts: data.baseGuestAmounts,
            additionalGuestAmounts: data.additionalGuestAmounts
        });

        const savedRatePlan = await newRatePlan.save();
        return savedRatePlan;
    }

    /**
     * Convert rate plan data to date wise data
     */
    async convertDateWise(ratePlanCreateData: any) {
        const {
            hotelCode,
            hotelName,
            invTypeCode,
            ratePlanCode,
            startDate,
            endDate,
            days,
            currencyCode,
            baseGuestAmounts,
            additionalGuestAmounts
        } = ratePlanCreateData;

        // Validate required fields
        if (!hotelCode || !invTypeCode || !ratePlanCode) {
            throw new Error('Missing required fields for convert date wise: hotelCode, invTypeCode, or ratePlanCode');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateWiseData: Partial<IRateAmountDateWise>[] = [];

        // Mapping days names to day numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayNumberMap = {
            sun: 0,
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6
        };

        /**
         * Generate one record per day from startDate to endDate (exclusive)
         */
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const currentDate = new Date(date);
            const dayOfWeek = currentDate.getDay(); // 0-6 (Sunday-Saturday)

            /**
             * Check if this day is enabled in the days configuration
             */
            let isDayEnabled = false;
            let currentDayKey = '';

            /**
             * Find which day key corresponds to this day of week
             */
            for (const [dayKey, dayNumber] of Object.entries(dayNumberMap)) {
                if (dayNumber === dayOfWeek) {
                    currentDayKey = dayKey;
                    isDayEnabled = days[dayKey as keyof typeof days];
                    break;
                }
            }

            /**
             * Only create record if the day is enabled (true)
             */
            if (isDayEnabled) {
                console.log(`Creating rate plan for ${currentDate.toDateString()} (${currentDayKey})`);

                dateWiseData.push({
                    hotelCode,
                    hotelName,
                    invTypeCode,
                    ratePlanCode,
                    startDate: new Date(currentDate),
                    endDate: new Date(currentDate.getTime() + 86400000),

                    /**
                     * Set only the current day to true, others to false
                     */
                    days: {
                        mon: currentDayKey === 'mon',
                        tue: currentDayKey === 'tue',
                        wed: currentDayKey === 'wed',
                        thu: currentDayKey === 'thu',
                        fri: currentDayKey === 'fri',
                        sat: currentDayKey === 'sat',
                        sun: currentDayKey === 'sun'
                    },
                    currencyCode,
                    baseByGuestAmts: baseGuestAmounts,
                    additionalGuestAmounts,
                    createdAt: new Date()
                });
            } else {
                console.log(`Skipping rate plan for ${currentDate.toDateString()} (${currentDayKey}) - day is disabled`);
            }
        }

        console.log(`Generated ${dateWiseData.length} rate plan records for enabled days`);
        return dateWiseData;
    }


    /**
 * Insert date wise rate plan data with upsert functionality using bulk operations
 * @param data 
 */
    async ratePlanCreateDateWise(data: any) {
        if (data.length === 0) {
            return { insertedCount: 0, updatedCount: 0 };
        }

        const bulkOps = data.map(item => ({
            updateOne: {
                filter: {
                    hotelCode: item.hotelCode,
                    invTypeCode: item.invTypeCode,
                    ratePlanCode: item.ratePlanCode,
                    startDate: item.startDate,
                    endDate: item.endDate
                },
                update: {
                    $set: {
                        days: item.days,
                        currencyCode: item.currencyCode,
                        baseByGuestAmts: item.baseByGuestAmts,
                        additionalGuestAmounts: item.additionalGuestAmounts,
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        hotelName: item.hotelName,
                        createdAt: item.createdAt || new Date()
                    }
                },
                upsert: true
            }
        }));

        try {
            const bulkResult = await RateAmountDateWise.bulkWrite(bulkOps, { ordered: false });
            return {
                insertedCount: bulkResult.upsertedCount,
                updatedCount: bulkResult.modifiedCount,
                matchedCount: bulkResult.matchedCount
            };
        } catch (error) {
            console.error('Error in bulk rate plan operation:', error);
            throw new Error('Failed to create/update rate plans in bulk');
        }
    }
}