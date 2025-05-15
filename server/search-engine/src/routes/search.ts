import { Router } from "express";
import { search,searchAmenities } from "../controllers/search.controllers";

const router: Router = Router();

router.post("/", search);
router.post("/search-amenities", searchAmenities);


export default router;
