"use strict";
// import { createRoomRatePlan, updateRoomRatePlan, getRoomRatePlan, deleteRoomRatePlan, getAllRatePlans } from "../../controller/ratePlan.controller";
// import { protect } from "@quotus_packages/auth_middleware";
// import { createPaymentMethod } from "../../controller/property/paymentmethod.controller";
// import { getAllBrand, getBrandDetailsByID, updateExistingBrand } from "../../controller/brand.controller";
// import { getAllPropertiesOfCategory } from "../../controller/propertyByCategory.controller";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../../controller");
const propertycategory_controller_1 = require("../../controller/propertycategory.controller");
const propertyamenity_controller_1 = require("../../controller/propertyamenity.controller");
const express_1 = require("express");
const propertyInfo_controller_1 = require("../../controller/propertyInfo.controller");
const propertyaddress_controller_1 = require("../../controller/propertyaddress.controller");
const auth_middleware_1 = require("../../../../user_authentication/src/Middleware/auth.middleware");
const getHotelDetails_controller_1 = require("../../controller/getHotelDetails.controller");
const router = (0, express_1.Router)();
exports.default = (app) => {
    app.use("/property", router);
    // API for brand to db
    // router.route("/updateExistingBrand").patch(updateExistingBrand as any);
    // router.route("/deleteBrand/:_id").delete(deleteExistingBrandByID as any);
    // router.route("/getBrand/:_id").get(getBrandDetailsByID as any);
    // router.route("/getAllBrand").get(getAllBrand as any);
    // router
    // .route("/payment_method")
    // .post(protect as any, createPaymentMethod as any);
    // router.route("/property-category").get(getAllPropertiesOfCategory as any);
    // property type
    router
        .route("/type")
        .post(auth_middleware_1.protect, controller_1.createPropertyType)
        .get(controller_1.getPropertyTypes);
    router.route("/category/:propertyCategoryID").get(propertycategory_controller_1.getPropertyCategory);
    router.route("/getAdminProperties").get(auth_middleware_1.protect, propertyInfo_controller_1.getAdminProperties);
    router.route("/me").get(auth_middleware_1.protect, propertyInfo_controller_1.getMyProperties);
    // get all property rateplans
    // router.route("/getRateplan/:id").get(protect as any, getAllRatePlans as any)
    // property category
    router
        .route("/category")
        .get(propertycategory_controller_1.getAllPropertyCategories)
        .post(auth_middleware_1.protect, propertycategory_controller_1.createPropertyCategory);
    // property address router
    router.route("/address").post(auth_middleware_1.protect, propertyaddress_controller_1.createPropertyAddress);
    router
        .route("/address/:id")
        .get(propertyaddress_controller_1.getPropertyAddressById)
        .patch(auth_middleware_1.protect, propertyaddress_controller_1.updatePropertyAddress)
        .delete(auth_middleware_1.protect, propertyaddress_controller_1.deletePropertyAddress);
    router
        .route("/addressbyid/:id")
        .patch(auth_middleware_1.protect, propertyaddress_controller_1.updatePropertyAddressBypropertyid);
    // // property aminites router
    router
        .route("/amenities")
        .post(auth_middleware_1.protect, propertyamenity_controller_1.createPropertyAminity);
    router
        .route("/Aminity/:id")
        .patch(auth_middleware_1.protect, propertyamenity_controller_1.updatePropertyAmenity);
    // property router
    router.route("/properties").get(propertyInfo_controller_1.getProperties);
    router
        .route("/")
        .get(propertyInfo_controller_1.getAllProperty)
        .post(auth_middleware_1.protect, propertyInfo_controller_1.createpropertyInfo);
    router.route("/unique-cities").get(propertyaddress_controller_1.getUniqueCities);
    router
        .route("/:id")
        .get(propertyInfo_controller_1.getPropertyInfoById)
        .patch(auth_middleware_1.protect, propertyInfo_controller_1.updatePropertyInfo)
        .delete(auth_middleware_1.protect, propertyInfo_controller_1.deleteProperty);
    // router
    //   .route("/price/:id")
    //   .post(protect as any, createRoomRatePlan as any)
    //   .patch(protect as any, updateRoomRatePlan as any)
    //   .get(getRoomRatePlan as any)
    //   .delete(protect as any, deleteRoomRatePlan as any);
    router.route("/location/:location").get(getHotelDetails_controller_1.getAllHotelDetailsAccordingToLocation);
};
//# sourceMappingURL=property.route.js.map