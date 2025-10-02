// import { createRoomRatePlan, updateRoomRatePlan, getRoomRatePlan, deleteRoomRatePlan, getAllRatePlans } from "../../controller/ratePlan.controller";
// import { protect } from "@quotus_packages/auth_middleware";
// import { createPaymentMethod } from "../../controller/property/paymentmethod.controller";
// import { getAllBrand, getBrandDetailsByID, updateExistingBrand } from "../../controller/brand.controller";
// import { getAllPropertiesOfCategory } from "../../controller/propertyByCategory.controller";

import { createPropertyType, getPropertyTypes } from "../../controller";
import { createPropertyCategory, getAllPropertyCategories, getPropertyCategory, } from "../../controller/propertycategory.controller";
import { updatePropertyAmenity, createPropertyAminity } from "../../controller/propertyamenity.controller";
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
  router
    .route("/type")
    .post(protect as any, createPropertyType as any)
    .get(getPropertyTypes as any);
  router.route("/category/:propertyCategoryID").get(getPropertyCategory as any);


  router.route("/getAdminProperties").get(protect as any, getAdminProperties as any);
  router.route("/me").get(protect as any, getMyProperties as any);

  // property category
  router
    .route("/category")
    .get(getAllPropertyCategories as any)
    .post(protect as any, createPropertyCategory as any);

  // property address router
  router.route("/address").post(protect as any, createPropertyAddress as any);
  router
    .route("/address/:id")
    .get(getPropertyAddressById as any)
    .patch(protect as any, updatePropertyAddress as any)
    .delete(protect as any, deletePropertyAddress as any);

  router
    .route("/addressbyid/:id")
    .patch(protect as any, updatePropertyAddressBypropertyid as any);

  // // property aminites router
  router
    .route("/amenities")
    .post(protect as any, createPropertyAminity as any);
  router
    .route("/Aminity/:id")
    .patch(protect as any, updatePropertyAmenity as any);

  // property router
  router.route("/properties").get(getProperties as any);

  router
    .route("/")
    .get(getAllProperty as any)
    .post(protect as any, createpropertyInfo as any);

  router.route("/unique-cities").get(getUniqueCities as any);

  router
    .route("/:id")
    .get(getPropertyInfoById as any)
    // .patch(protect as any, updatePropertyInfo as any)
    .delete(protect as any, deleteProperty as any);

  router.route("/:id").patch(protect as any, propertyInfoController.propertyInfoUpdate.bind(propertyInfoController));

  router.route("/location/:location").get(getAllHotelDetailsAccordingToLocation as any);


  // Promocode API's
  /**
   * Extranet specific
   * Create promo code
   */
  router.route("/promo/create").post(protect as any, promoCodeController.createPromoCode.bind(promoCodeController));

  /**
   * Extranet specific
   * Get promo Code
   */
  router.route("/promo/get").get(protect as any, promoCodeController.getPromoCode.bind(promoCodeController));

  /**
   * Extranet specific
   * Update promo code details
   */
  router.route("/promo/update/:promoId").patch(protect as any, promoCodeController.updatePromoCode.bind(promoCodeController));

  /**
   * Extranet specific
   * Delete promo code
   */
  router.route("/promo/delete/:promoId").delete(protect as any, promoCodeController.deletePromoCode.bind(promoCodeController));

  /**
   * Extranet specific
   * Tracking the promocode usage 
   */
  router.post('/promo/usage/track', protect as any, promoCodeController.trackPromocodeUsage.bind(promoCodeController));

  /**
   * Extranet specific
   * Cancel promocode usage
   */
  router.post('/promo/usage/cancel', protect as any, promoCodeController.cancelPromocodeUsage.bind(promoCodeController));

  /**
   * Extranet specific
   * Get promocode usage stats
   */
  router.get('/promo/usage/stats/:promoId', protect as any, promoCodeController.getPromocodeUsageStats.bind(promoCodeController));

  /**
   * Extranet specific
   * Get recent usage for a specific promocode
   */
  router.get('/promo/usage/recent/:promoId', protect as any, promoCodeController.getPromocodeRecentUsage.bind(promoCodeController));

  /**
   * Extranet specific
   * Get property promocode analytics
   */
  router.get('/promo/usage/analytics/property/:propertyId', protect as any, promoCodeController.getPropertyPromocodeAnalytics.bind(promoCodeController));


  /**
   * Extranet specific
   * Get promocode by id
   */
  router.get('/promo/:promoId', protect as any, promoCodeController.getPromocodeById.bind(promoCodeController));

  /**
   * Extranet specific
   * Search promocodes
   */
  router.post('/promo/search', authenticateCustomer ,promoCodeController.searchPromocodes.bind(promoCodeController));


  /**
   * **************************************************************************
   * **************************************************************************
   */


  // Promocode usage API's
  /**
   * Booking engine specific
   * Validate promocode 
   * Customer will validate the promocode with promo code and booking price
   */
  router.post('/promo/validate', authenticateCustomer as any, promoCodeController.validatePromocode.bind(promoCodeController));

  /**
   * Booking engine specific
   * Get user's promocode usage history
   */
  router.get('/usage/history', authenticateCustomer as any, promoCodeController.getUserPromocodeHistory.bind(promoCodeController));

  /**
   * Booking engine specific
   * customers to track their own personal promocode usage
   */
  router.get('/usage/tracker', authenticateCustomer as any, promoCodeController.userUsageTracker.bind(promoCodeController));

  /**
   * Booking engine specific
   * Check if customer can use a promocode
   */
  router.get('/eligibility/:promoCodeId', authenticateCustomer as any, promoCodeController.checkUserPromocodeEligibility.bind(promoCodeController));

};
