import { Router } from "express";
import {
  createpropertyInfo,
  getAllProperty,
  getPropertyInfoById,
  updatePropertyInfo,
  deleteProperty,
  getMyProperties,
  getProperties,
} from "../controller/propertyInfo.controller";
import {
  createPropertyAddress,
  updatePropertyAddress,
  deletePropertyAddress,
  getPropertyAddressById,
} from "../controller/propertyaddress.controller";

import { createPaymentMethod } from "../controller/property/paymentmethod.controller";
// import { protect } from "@quotus_packages/auth_middleware";
import { protect } from "../middlewares/auth.middleware";
import {
  createPropertyCategory,
  getAllPropertyCategories,
  getPropertyCategory,
} from "../controller/propertycategory.controller";
import { createPropertyType } from "../controller/propertytype.controller";
import { updatePropertyAmenity } from "../controller/propertyamenity.controller";


const router = Router();

router.route("/me").get(protect as any, getMyProperties as any);

router
  .route("/category")
  .get(getAllPropertyCategories as any)
  .post(protect as any, createPropertyCategory as any);

router.route("/category/:propertyCategoryID").get(getPropertyCategory as any);

router.route("/type").post(protect as any, createPropertyType as any);

// property payment router
router
  .route("/payment_method")
  .post(protect as any, createPaymentMethod as any);

// property address router
router.route("/address").post(protect as any, createPropertyAddress as any);
router
  .route("/address/:id")
  .get(getPropertyAddressById as any)
  .patch(protect as any, updatePropertyAddress as any)
  .delete(protect as any, deletePropertyAddress as any);

// // property aminites router
// router
//   .route("/amenities")
//   .post(protect as any, createPropertyAmeniteCategory as any);
// router.route("/amenities/:id").get(getPropertyAmeniteCategory as any);
// router.route("/allamenities").get(getPropertyAminitesategories as any);
// router.route("/destination").get(getDestinationType as any);

// property router
router.route("/properties").get(getProperties as any);

router
  .route("/")
  .get(getAllProperty as any)
  .post(protect as any, createpropertyInfo as any);
router
  .route("/:id")
  .get(getPropertyInfoById as any)
  .patch(protect as any, updatePropertyInfo as any)
  .delete(protect as any, deleteProperty as any);

router.route("/:id/amenity").patch(updatePropertyAmenity as any);


export default router;
