import { IReferralRepository, IReferralRequest, IReferralResponse } from "../interfaces";
import { ReferralModel, IReferral } from "../models";
import { GenerateUtils } from "../utils";

export class ReferralRepository implements IReferralRepository {
    /**
     * Creates and saves a new referral document to the database.
     * 
     * @param referral - Partial referral data containing referrerId, refereeId, referralCodeUsed, and status
     * @returns The newly created referral document
     */
    async createReferral(referral: Partial<IReferral>): Promise<IReferral> {
        const newReferral = new ReferralModel(referral);
        return await newReferral.save();
    }

    /**
     * Finds a referral record based on both referrer and referee IDs.
     * Useful to prevent duplicate referrals between the same users.
     * 
     * @param referrerId - The ID of the user who referred (string format)
     * @param refereeId - The ID of the user who was referred (string format)
     * @returns The matched referral document or null if not found
     */
    async findByReferrerAndReferee(referrerId: string, refereeId: string): Promise<IReferral | null> {
        return await ReferralModel.findOne({
            referrerId: GenerateUtils.toObjectId(referrerId),
            refereeId: GenerateUtils.toObjectId(refereeId),
        });
    }

    /**
     * Retrieves all referrals made by a specific referrer, sorted by creation date (newest first).
     * 
     * @param referrerId - The ID of the referrer user (string format)
     * @returns An array of referral documents made by the referrer
     */
    async findByReferrerId(payload: IReferralRequest): Promise<IReferralResponse> {

        /**
         * I have commented this code because initially I have used this approach to retrieve referrals
         * but now I am using aggregation pipeline to retrieve the same data
         */
        // const [referrals, total]: [IReferral[], number] = await Promise.all([
        //     ReferralModel.find({ referrerId: toObjectId(payload.referrerId) })
        //         .sort({ createdAt: -1 })
        //         .skip(payload.skip)
        //         .limit(payload.limit)
        //         .populate("refereeId", "firstName lastName email phone address createdAt", undefined, { lean: true }),
        //     ReferralModel.countDocuments({ referrerId: toObjectId(payload.referrerId) })
        // ]);

        // // Extract only referee details
        // const referees = referrals.map(referral => {
        //     const referee = typeof referral.refereeId === 'object' && 'toObject' in referral.refereeId
        //         ? (referral.refereeId as any).toObject()
        //         : {};

        //     return {
        //         referralRecordId: referral._id,
        //         ...referee
        //     };
        // });

        const [result] = await ReferralModel.aggregate([
            { $match: { referrerId: GenerateUtils.toObjectId(payload.referrerId) } },
            {
                $facet: {
                    data: [
                        {
                            $lookup: {
                                from: "customermodels",
                                localField: "refereeId",
                                foreignField: "_id",
                                as: "referee"
                            }
                        },
                        { $unwind: "$referee" },
                        {
                            $project: {
                                _id: 0,
                                referralRecordId: "$_id",
                                firstName: "$referee.firstName",
                                lastName: "$referee.lastName",
                                email: "$referee.email",
                                phone: "$referee.phone",
                                address: "$referee.address",
                                createdAt: "$referee.createdAt"
                            }
                        },
                        { $sort: { createdAt: -1 } },
                        { $skip: payload.skip },
                        { $limit: payload.limit }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const response = {
            data: result.data,
            total: result.totalCount[0]?.count || 0,
            page: Math.ceil(((result.totalCount[0]?.count || 0) - payload.skip) / payload.limit),
            limit: payload.limit
        };

        return response;

    }

    /**
     * Finds a referral record where the specified user is the referee.
     * 
     * @param refereeId - The ID of the user who was referred (string format)
     * @returns The referral document where the user was referred or null if not found
     */
    async findByRefereeId(refereeId: string): Promise<IReferral | null> {
        return await ReferralModel.findOne({
            refereeId: GenerateUtils.toObjectId(refereeId),
        });
    }

}
