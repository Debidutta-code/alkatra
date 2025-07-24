// import { NextFunction, Response } from "express";
// import { Request } from "../utils/catchAsync";
// import { PropertyInfo } from "../model/property.info.model";
// import PropertyPrice from "../model/ratePlan.model";
// import { Room } from "../model/room.model";

// export const createRoomRatePlan = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { id } = req.params;  // property_id
//         const {
//             applicable_room_type,
//             meal_plan,
//             room_price,
//             rate_plan_name,
//             rate_plan_description,
//             min_length_stay,
//             max_length_stay,
//             min_book_advance,
//             max_book_advance
//         } = req.body;
//         console.log("==== Incoming Create Rate Plan Data ====");
//         console.log("Params:", req.params);
//         console.log("Body:", req.body);

//         if (!req.body) {
//             return res.status(401).json({ success: false, message: "All fields are required" })
//         }
//         if (!id) {
//             return res.status(401).json({ success: false, message: "Property ID is required" })
//         }

//         // create property price
//         const roomRatePlan = await PropertyPrice.create({
//             property_id: id,
//             applicable_room_type,
//             meal_plan,
//             room_price,
//             rate_plan_name,
//             rate_plan_description,
//             min_length_stay,
//             max_length_stay,
//             min_book_advance,
//             max_book_advance
//         })

//         // update property info with property price
//         await PropertyInfo.findByIdAndUpdate(
//             { _id: id },
//             { rate_plan: roomRatePlan._id },
//             { new: true }
//         );

//         await Room.findByIdAndUpdate(
//             { _id: applicable_room_type },
//             { rateplan_created: true },
//             { new: true }
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Property Price created",
//             roomRatePlan: roomRatePlan
//         })
//     }
//     catch (error: any) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// export const updateRoomRatePlan = async (req: Request, res: Response) => {
//     try {
//         const rateplanId = req.params.id; // Assuming the rate plan ID is passed in the URL
//         console.log(`Updating Rate Plan with ID: ${rateplanId}`);

//         const {
//             meal_plan,
//             room_price,
//             rate_plan_name,
//             rate_plan_description,
//             min_length_stay,
//             max_length_stay,
//             min_book_advance,
//             max_book_advance
//         } = req.body;

//         console.log("==== Incoming Update Rate Plan Data ====");
//         console.log("Params:", req.params);
//         console.log("Body:", req.body);

//         // Find and update the rate plan by its ID
//         const updatedRatePlan = await PropertyPrice.findByIdAndUpdate(
//             rateplanId,
//             {
//                 $set: {
//                     meal_plan,
//                     room_price,
//                     rate_plan_name,
//                     rate_plan_description,
//                     min_length_stay,
//                     max_length_stay,
//                     min_book_advance,
//                     max_book_advance
//                 }
//             },
//             { new: true, runValidators: true } // Ensure the updated document is returned and validators are run
//         );

//         if (!updatedRatePlan) {
//             return res.status(404).json({ success: false, message: "No rate plan found with the provided ID" });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Rate plan updated successfully",
//             updatedRatePlan: updatedRatePlan
//         });
//     } catch (error) {
//         console.error("Error updating rate plan:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal error while updating rate plan, please try again later"
//         });
//     }
// };

// export const getRoomRatePlan = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;  // room_id
//         if (!id) {
//             return res.status(401).json({ success: false, message: "Room ID is required" })
//         }
//         const ratePlanList = await PropertyPrice.find({ applicable_room_type: id });
//         if (!ratePlanList) {
//             return res.status(401).json({ success: false, message: "No rateplan found for this room" })
//         }
//         return res.status(200).json({
//             success: true,
//             message: "Price list fetched successfully",
//             totalRatePlan: ratePlanList.length,
//             ratePlanList: ratePlanList
//         })
//     }
//     catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal error while fetching price, please try again later"
//         })
//     }
// }

// export const deleteRoomRatePlan = async (req: Request, res: Response) => {
//     try {
//         // as multiple rateplans can be associated with the same room so we need to update specific rateplan only using it _id.
//         const { id } = req.params;  // rate plan id
//         if (!id) {
//             return res.status(401).json({ success: false, message: "Rate plan ID is required" })
//         }
//         const ratePlan = await PropertyPrice.findByIdAndDelete({ _id: id });
//         if (!ratePlan) {
//             return res.status(401).json({ success: false, message: "No rateplan found with this id" })
//         }
//         return res.status(200).json({
//             success: true,
//             message: "Rateplan deleted successfully",
//             deletedRatePlan: ratePlan
//         })
//     }
//     catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal error while deleting price, please try again later"
//         })
//     }
// }

// export const getAllRatePlans = async (req: Request, res: Response) => {
//     try {
//         const property_id = req.params.id;
//         console.log("property_id: ", property_id)
//         if (!property_id) {
//             return res.status(401).json({ success: false, message: "Property ID is required" })
//         }

//         const ratePlanList = await PropertyPrice.find({ property_id: property_id });
//         if (!ratePlanList) {
//             return res.status(401).json({ success: false, message: "No rateplan found for this property" })
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Price list fetched successfully",
//             totalRatePlan: ratePlanList.length,
//             ratePlanList: ratePlanList
//         })
//     } 
//     catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal error while deleting price, please try again later"
//         })
//     }
// }