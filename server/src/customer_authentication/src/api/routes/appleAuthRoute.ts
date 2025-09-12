import { Router } from 'express';
import { authenticateCustomer } from "../../middleware";
import { customer_authentication_container } from '../../container';

const { appleAuthController } = customer_authentication_container;

const router = Router();

/**
 * API end point for Apple authentication
 */
router
    .route('/auth/apple')
    .post(appleAuthController.authenticate.bind(appleAuthController));

/**
 * Get the user information by providing JWT token
 * (Reusing the same endpoint as Google)
 */
router
    .route('/api/user')
    .get(authenticateCustomer, appleAuthController.getUser.bind(appleAuthController));

export default router;