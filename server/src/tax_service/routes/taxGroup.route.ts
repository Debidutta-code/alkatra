/**
 * 1. Create a new tax group
 * 2. Get all tax group detail's
 * 3. Update a tax group
 * 4. Delete a tax group
 * 5. Get tax group by ID
 */

import { RequestHandler, Router } from "express";
import { container } from "../container";
import { validateRequest } from "../middleware";
import { validateCreateTaxGroup, validateUpdateTaxGroup } from "../schemas";
import { protect, restrictTo } from "../../user_authentication/src/Middleware/auth.middleware";

const router: Router = Router();


/**
 * 1. Create a new tax group
 */
router
    .route("/")
    .post(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        validateRequest(validateCreateTaxGroup),                                    // Validation middleware for request body
        container.taxGroupController.create.bind(container.taxGroupController)      // Controller method
    );


/**
 * 2. Get all tax group details for a specific hotel
 */
router
    .route("/hotel/:hotelId")
    .get(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        container.taxGroupController.getAll.bind(container.taxGroupController)      // Controller method
    );


/**
 * 3. Get tax group by ID
 * 4. Update a tax group
 * 5. Delete a tax group
 */
router
    .route("/:id")
    .get(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        container.taxGroupController.getById.bind(container.taxGroupController)     // Controller method
    )
    .put(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        validateRequest(validateUpdateTaxGroup),                                    // Validation middleware for request body
        container.taxGroupController.update.bind(container.taxGroupController)      // Controller method
    )
    .delete(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        container.taxGroupController.delete.bind(container.taxGroupController)      // Controller method
    );


export { router as TaxGroupRouter };