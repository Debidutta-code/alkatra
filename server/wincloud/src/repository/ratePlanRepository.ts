import { RateAmount } from '../model/ratePlanModel';
import { RatePlanData } from '../interface/ratePlanInterface';

export class RatePlanRepository {
    async upsertRateAmount(data: RatePlanData): Promise<any> {
        console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Upserting rate amount for hotel: ${JSON.stringify(data, null, 2)}`);
        const query = {
            hotelCode: data.hotelCode,
            hotelName: data.hotelName,
            invTypeCode: data.invTypeCode,
        };

        const update = {
            $set: {
                ratePlanCode: data.ratePlanCode,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                days: data.days,
                currencyCode: data.currencyCode,
                baseByGuestAmts: data.baseByGuestAmts,
                additionalGuestAmounts: data.additionalGuestAmounts,
                updatedAt: new Date(),
            },
        };

        const options = {
            upsert: true,
            new: true,
        };

        const updatedRateAmount = await RateAmount.findOneAndUpdate(query, update, options);
        return updatedRateAmount.toJSON();
    }

    async createRateAmount(data: RatePlanData): Promise<any> {
        console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Creating rate amount for hotel: ${JSON.stringify(data, null, 2)}`);
        const rateAmount = new RateAmount({
            hotelCode: data.hotelCode,
            hotelName: data.hotelName,
            invTypeCode: data.invTypeCode,
            ratePlanCode: data.ratePlanCode,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            days: data.days,
            currencyCode: data.currencyCode,
            baseByGuestAmts: data.baseByGuestAmts,
            additionalGuestAmounts: data.additionalGuestAmounts,
        });
        const savedRateAmount = await rateAmount.save();
        return savedRateAmount.toJSON();
    }


    /**
     * Retrieves all room details for a given hotel code.
     * @param hotelCode 
     */
    async getRoomsByHotelCode(hotelCode: string): Promise<any> {
        return await RateAmount.find({ hotelCode: hotelCode });
    }


    /**
     * Retrieves room details based on hotel code, inventory type code, and date range.
     * @param hotelCode 
     * @param invTypeCode 
     * @param startDate 
     * @param endDate 
     */
    async getRoomDetails(hotelCode: string, invTypeCode: string, startDate: Date, endDate: Date): Promise<any> {
        await RateAmount.find({
            invTypeCode,
            hotelCode,
            startDate: { $lte: startDate },
            endDate: { $gte: endDate }
        }).lean().exec();
    }
}