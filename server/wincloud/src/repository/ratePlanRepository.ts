// import { RateAmount } from '../model/ratePlanModel';
// import { RatePlanData } from '../interface/ratePlanInterface';
// import { FilterQuery, UpdateQuery } from 'mongoose';
// import RateAmountDateWise from "../model/ratePlanDateWise.model"
// export class RatePlanRepository {
//     async upsertRateAmount(data: RatePlanData): Promise<any> {
//         console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Upserting rate amount for hotel: ${JSON.stringify(data, null, 2)}`);
//         const query = {
//             hotelCode: data.hotelCode,
//             hotelName: data.hotelName,
//             invTypeCode: data.invTypeCode,
//             ratePlanCode: data.ratePlanCode,
//         };

//         const update = {
//             $set: {
//                 // ratePlanCode: data.ratePlanCode,
//                 startDate: new Date(data.startDate),
//                 endDate: new Date(data.endDate),
//                 days: data.days,
//                 currencyCode: data.currencyCode,
//                 baseByGuestAmts: data.baseByGuestAmts,
//                 additionalGuestAmounts: data.additionalGuestAmounts,
//                 updatedAt: new Date(),
//             },
//         };

//         const options = {
//             upsert: true,
//             new: true,
//         };

//         const updatedRateAmount = await RateAmount.findOneAndUpdate(query, update, options);
//         return updatedRateAmount.toJSON();
//     }

// async createRateAmount(data: RatePlanData): Promise<any> {
//     console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Creating rate amount for hotel: ${JSON.stringify(data, null, 2)}`);

//     // Save to main RateAmount database (keep original endDate)
//     const rateAmount = new RateAmount({
//         hotelCode: data.hotelCode,
//         hotelName: data.hotelName,
//         invTypeCode: data.invTypeCode,
//         ratePlanCode: data.ratePlanCode,
//         startDate: new Date(data.startDate),
//         endDate: new Date(data.endDate), // Keep original endDate from data
//         days: data.days,
//         currencyCode: data.currencyCode,
//         baseByGuestAmts: data.baseByGuestAmts,
//         additionalGuestAmounts: data.additionalGuestAmounts,
//     });

//     const savedRateAmount = await rateAmount.save();

//     // Generate date-wise records for RateAmountDateWise using the saved data
//     const dateWiseRecords = [];
//     const startDate = new Date(savedRateAmount.startDate);
//     const endDate = new Date(savedRateAmount.endDate);

//     // Generate records for each date in the range (similar to your GET endpoint logic)
//     for (
//         let currentDate = new Date(startDate);
//         currentDate < endDate;
//         currentDate.setDate(currentDate.getDate() + 1)
//     ) {
//         console.log("currentDate", currentDate.getDate());

//         const dateWiseRecord = new RateAmountDateWise({
//             hotelCode: savedRateAmount.hotelCode,
//             hotelName: savedRateAmount.hotelName,
//             invTypeCode: savedRateAmount.invTypeCode,
//             ratePlanCode: savedRateAmount.ratePlanCode,
//             startDate: new Date(currentDate), // Single date for this record
//             endDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // currentDate + 1 day
//             currencyCode: savedRateAmount.currencyCode,
//             baseByGuestAmts: savedRateAmount.baseByGuestAmts,
//             additionalGuestAmounts: savedRateAmount.additionalGuestAmounts,
//         });

//         dateWiseRecords.push(dateWiseRecord);
//     }

//     // Save all date-wise records using Promise.all for better performance
//     try {
//         const savedDateWiseRecords = await Promise.all(
//             dateWiseRecords.map(record => record.save())
//         );

//         console.log(`Created ${savedDateWiseRecords.length} date-wise records for ${savedRateAmount.hotelCode} - ${savedRateAmount.ratePlanCode}`);

//         return {
//             mainRecord: savedRateAmount.toJSON(),
//             dateWiseRecords: savedDateWiseRecords.map(record => record.toJSON()),
//             totalDateWiseRecords: savedDateWiseRecords.length
//         };
//     } catch (error) {
//         console.error(`Error saving date-wise records for ${savedRateAmount.hotelCode} - ${savedRateAmount.ratePlanCode}:`, error);
//         // You might want to decide whether to rollback the main record or handle this differently
//         throw error;
//     }
// }

//     /**
//      * Retrieves all room details for a given hotel code.
//      * @param hotelCode 
//      */
//     async getRoomsByHotelCode(hotelCode: string): Promise<any> {
//         return await RateAmount.find({ hotelCode: hotelCode }).exec();
//     }


//     /**
//      * Retrieves room details based on hotel code, inventory type code, and date range.
//      * @param hotelCode 
//      * @param invTypeCode 
//      * @param startDate 
//      * @param endDate 
//      */
//     async getRoomDetails(hotelCode: string, invTypeCode: string, startDate: Date, endDate: Date): Promise<any> {
//         await RateAmount.find({
//             invTypeCode,
//             hotelCode,
//             startDate: { $lte: startDate },
//             endDate: { $gte: endDate }
//         }).lean().exec();
//     }


//     /**
//      * Updates a single rate amount document based on the provided filter and update.
//      * @param filter 
//      * @param update 
//      * @returns 
//      */
//     async updateOne(filter: FilterQuery<any>, update: UpdateQuery<any>) {
//         return await RateAmount.findOneAndUpdate(filter, update, { new: true });
//     }


//     /**
//      * Updates multiple rate amount documents based on the provided filter and update.
//      * @param filter 
//      * @param update 
//      * @returns 
//      */
//     async updateMany(filter: FilterQuery<any>, update: UpdateQuery<any>) {
//         return await RateAmount.updateMany(filter, update);
//     }


//     /**
//      * Updates multiple rate amounts in bulk.
//      * @param operations Array of update operations
//      * @returns Result of the bulk write operation
//      */
//     async bulkWrite(operations: any[]) {
//         if (!Array.isArray(operations) || operations.length === 0) {
//             throw new Error("Bulk operations array must not be empty.");
//         }

//         return await RateAmount.bulkWrite(operations, { ordered: false });
//     }
// }

// ----------------***************************--------------------------------------

// import { RateAmount } from '../model/ratePlanModel';
// import { RatePlanData } from '../interface/ratePlanInterface';
// import { FilterQuery, UpdateQuery } from 'mongoose';

// export class RatePlanRepository {
//     async upsertRateAmount(data: RatePlanData[]): Promise<any> {
//         console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Upserting rate amounts for hotels: ${JSON.stringify(data, null, 2)}`);
//         const operations = data.map(plan => ({
//             updateOne: {
//                 filter: {
//                     hotelCode: plan.hotelCode,
//                     hotelName: plan.hotelName,
//                     invTypeCode: plan.invTypeCode,
//                     ratePlanCode: plan.ratePlanCode,
//                 },
//                 update: {
//                     $set: {
//                         // ratePlanCode: plan.ratePlanCode,
//                         startDate: new Date(plan.startDate),
//                         endDate: new Date(plan.endDate),
//                         days: plan.days,
//                         currencyCode: plan.currencyCode,
//                         baseByGuestAmts: plan.baseByGuestAmts,
//                         additionalGuestAmounts: plan.additionalGuestAmounts,
//                         updatedAt: new Date(),
//                     },
//                 },
//                 upsert: true,
//             },
//         }));
//         console.log(`Upserting rate amount for hotel rate plan completed`);
//         return await RateAmount.bulkWrite(operations);
//     }
// }


import { RateAmount } from '../model/ratePlanModel';
import { RatePlanData } from '../interface/ratePlanInterface';
import { FilterQuery, UpdateQuery } from 'mongoose';
import RateAmountDateWise from '../model/ratePlanDateWise.model'; 

export class RatePlanRepository {
    async upsertRateAmount(data: RatePlanData[]): Promise<any> {
        console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Upserting rate amounts for hotels: ${JSON.stringify(data, null, 2)}`);

        const operations = data.map(plan => ({
            updateOne: {
                filter: {
                    hotelCode: plan.hotelCode,
                    hotelName: plan.hotelName,
                    invTypeCode: plan.invTypeCode,
                    ratePlanCode: plan.ratePlanCode,
                },
                update: {
                    $set: {
                        startDate: new Date(plan.startDate),
                        endDate: new Date(plan.endDate),
                        days: plan.days,
                        currencyCode: plan.currencyCode,
                        baseByGuestAmts: plan.baseByGuestAmts,
                        additionalGuestAmounts: plan.additionalGuestAmounts,
                        updatedAt: new Date(),
                    },
                },
                upsert: true,
            },
        }));

        const result = await RateAmount.bulkWrite(operations);
        console.log(`✅ Upserted RateAmount records`);

        // --- Now add date-wise entries ---
        const dateWiseRecords = [];

        for (const plan of data) {
            const start = new Date(plan.startDate);
            const end = new Date(plan.endDate);

            for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
                dateWiseRecords.push({
                    hotelCode: plan.hotelCode,
                    hotelName: plan.hotelName,
                    invTypeCode: plan.invTypeCode,
                    ratePlanCode: plan.ratePlanCode,
                    startDate: new Date(date),
                    endDate: new Date(date.getTime() + 86400000), // +1 day
                    days: plan.days,
                    currencyCode: plan.currencyCode,
                    baseByGuestAmts: plan.baseByGuestAmts,
                    additionalGuestAmounts: plan.additionalGuestAmounts,
                    createdAt: new Date()
                });
            }
        }

        if (dateWiseRecords.length > 0) {
            await RateAmountDateWise.insertMany(dateWiseRecords, { ordered: false });
            console.log(`✅ Inserted ${dateWiseRecords.length} date-wise records`);
        }

        return result;
    }
}
