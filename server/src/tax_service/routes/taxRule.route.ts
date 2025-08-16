/**
 * 1. Create a new tax rule
 * 4. Get all tax rules
 * 3. Get tax by ID
 * 4. Update a tax rule
 * 5. Delete a tax rule
 */

import { RequestHandler, Router } from "express";
import { validateCreateTaxRule, validateUpdateTaxRule } from "../schemas";
import { validateRequest } from "../middleware";
import { container } from "../container";
import { protect, restrictTo } from "../../user_authentication/src/Middleware/auth.middleware";

const router: Router = Router();


/**
 * 1. Create a new tax rule
 */
router
    .route("/")
    .post(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        validateRequest(validateCreateTaxRule),                                     // Validation middleware for request body
        container.taxRuleController.create.bind(container.taxRuleController)        // Controller method
    );

/**
 * 2. Get all tax rules for a specific hotel
 */
router
    .route("/hotel/:hotelId")
    .get(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        container.taxRuleController.getAll.bind(container.taxRuleController)        // Controller method
    );


/**
 * 3. Get tax by ID
 * 4. Update a tax rule
 * 5. Delete a tax rule
 */
router
    .route("/:id")
    .get(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control   
        container.taxRuleController.getById.bind(container.taxRuleController)        // Controller method
    )
    .put(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        validateRequest(validateUpdateTaxRule),                                     // Validation middleware for request body
        container.taxRuleController.update.bind(container.taxRuleController)        // Controller method
    )
    .delete(
        protect as RequestHandler,                                                  // Protected route - requires authentication
        restrictTo("superAdmin", "groupManager", "hotelManager") as RequestHandler, // Role-based access control
        container.taxRuleController.delete.bind(container.taxRuleController)        // Controller method
    );


export { router as TaxRuleRouter };