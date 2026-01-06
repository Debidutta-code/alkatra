// import { createRoomRatePlan, updateRoomRatePlan, getRoomRatePlan, deleteRoomRatePlan, getAllRatePlans } from "../../controller/ratePlan.controller";
// import { protect } from "@quotus_packages/auth_middleware";
// import { createPaymentMethod } from "../../controller/property/paymentmethod.controller";
// import { getAllBrand, getBrandDetailsByID, updateExistingBrand } from "../../controller/brand.controller";
// import { getAllPropertiesOfCategory } from "../../controller/propertyByCategory.controller";

import { createPropertyType, getPropertyTypes } from "../../controller";
import { createPropertyCategory, getAllPropertyCategories, getPropertyCategory, } from "../../controller/propertycategory.controller";
import { updatePropertyAmenity, createPropertyAminity } from "../../controller/propertyamenity.controller";
import { getDataSourceProviders, getDataSourceTypes } from "../../controller/dataSourceProvider.controller";
import { Router } from "express";
import {
  createpropertyInfo,
  getAllProperty,
  getPropertyInfoById,
  updatePropertyInfo,
  deleteProperty,
  getMyProperties,
  getProperties,
  getAdminProperties
} from "../../controller/propertyInfo.controller";
import {
  createPropertyAddress,
  updatePropertyAddress,
  deletePropertyAddress,
  getPropertyAddressById,
  updatePropertyAddressBypropertyid,
  getUniqueCities
} from "../../controller/propertyaddress.controller";
import { protect } from "../../../../user_authentication/src/Middleware/auth.middleware";
import { getAllHotelDetailsAccordingToLocation } from "../../controller/getHotelDetails.controller";
import { PropertyInfoController } from "../../controller/propertyInfo.controller";
import { PropertyInfoService } from "../../service/propertyInfo.service";
import { PropertyInfoRepository } from "../../repositories/propertyInfo.repository";
import { PromoCodeController } from "../../controller";
import { authenticateCustomer } from "../../../../customer_authentication/src/middleware";

const router = Router();

const propertyInfoRepository = PropertyInfoRepository.getInstance();
const propertyInfoService = PropertyInfoService.getInstance(propertyInfoRepository);
const propertyInfoController = new PropertyInfoController(propertyInfoService);
const promoCodeController = PromoCodeController.getInstance();

export default (app: Router) => {
  app.use("/property", router);

  // Property type routes
  router
    .route("/type")
    .post(protect as any, createPropertyType as any)
    .get(getPropertyTypes as any);

  // Property category routes - base route first, then parameterized routes
  router
    .route("/category")
    .get(getAllPropertyCategories as any)
    .post(protect as any, createPropertyCategory as any);

  router
    .route("/category/:propertyCategoryID")
    .get(getPropertyCategory as any);

  // Admin and user property routes
  router.route("/getAdminProperties").get(protect as any, getAdminProperties as any);
  router.route("/me").get(protect as any, getMyProperties as any);

  // Property address routes
  router.route("/address").post(protect as any, createPropertyAddress as any);
  router
    .route("/address/:id")
    .get(getPropertyAddressById as any)
    .patch(protect as any, updatePropertyAddress as any)
    .delete(protect as any, deletePropertyAddress as any);

  router
    .route("/addressbyid/:id")
    .patch(protect as any, updatePropertyAddressBypropertyid as any);

  // Property amenities routes
  router
    .route("/amenities")
    .post(protect as any, createPropertyAminity as any);
  router
    .route("/Aminity/:id")
    .patch(protect as any, updatePropertyAmenity as any);

  // Property routes
  router.route("/properties").get(getProperties as any);
  router.route("/unique-cities").get(getUniqueCities as any);

  router
    .route("/")
    .get(getAllProperty as any)
    .post(protect as any, createpropertyInfo as any);

  router
    .route("/:id")
    .get(getPropertyInfoById as any)
    .patch(protect as any, propertyInfoController.propertyInfoUpdate.bind(propertyInfoController))
    .delete(protect as any, deleteProperty as any);

  router.route("/location/:location").get(getAllHotelDetailsAccordingToLocation as any);

  // Promocode API's - Extranet specific
  router.route("/promo/create").post(protect as any, promoCodeController.createPromoCode.bind(promoCodeController));
  router.route("/promo/get").get(protect as any, promoCodeController.getPromoCode.bind(promoCodeController));
  router.route("/promo/update/:promoId").patch(protect as any, promoCodeController.updatePromoCode.bind(promoCodeController));
  router.route("/promo/delete/:promoId").delete(protect as any, promoCodeController.deletePromoCode.bind(promoCodeController));
  router.post('/promo/usage/track', protect as any, promoCodeController.trackPromocodeUsage.bind(promoCodeController));
  router.post('/promo/usage/cancel', protect as any, promoCodeController.cancelPromocodeUsage.bind(promoCodeController));
  router.get('/promo/usage/stats/:promoId', protect as any, promoCodeController.getPromocodeUsageStats.bind(promoCodeController));
  router.get('/promo/usage/recent/:promoId', protect as any, promoCodeController.getPromocodeRecentUsage.bind(promoCodeController));
  router.get('/promo/usage/analytics/property/:propertyId', protect as any, promoCodeController.getPropertyPromocodeAnalytics.bind(promoCodeController));
  router.get('/promo/:promoId', protect as any, promoCodeController.getPromocodeById.bind(promoCodeController));

  // Promocode usage API's - Booking engine specific
  router.post('/promo/search', authenticateCustomer, promoCodeController.searchPromocodes.bind(promoCodeController));
  router.post('/promo/validate', authenticateCustomer as any, promoCodeController.validatePromocode.bind(promoCodeController));
  router.get('/usage/history', authenticateCustomer as any, promoCodeController.getUserPromocodeHistory.bind(promoCodeController));
  router.get('/usage/tracker', authenticateCustomer as any, promoCodeController.userUsageTracker.bind(promoCodeController));
  router.get('/eligibility/:promoCodeId', authenticateCustomer as any, promoCodeController.checkUserPromocodeEligibility.bind(promoCodeController));
};