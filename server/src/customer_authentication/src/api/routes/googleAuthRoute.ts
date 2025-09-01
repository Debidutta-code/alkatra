import { Router } from 'express';
import { authenticateCustomer } from "../../middleware";
import { customer_authentication_container } from '../../container';
// import { AuthController } from '../../controllers/googleSocialAuth.controller';

const { googleAuthController } = customer_authentication_container;

const router = Router();
// const authController = new AuthController();

/**
 * API end point for Google authentication
 * It handles both web and mobile token
 */
// router.post('/auth/google', authController.postGoogleAuthData.bind(authController));
router
    .route('/auth/google')
    .post(googleAuthController.authenticate.bind(googleAuthController));


/**
 * Get the user information by providing JWT token
 */
// router.get('/api/user', authController.getUser.bind(authController));
router
    .route('/api/user')
    .get(authenticateCustomer, googleAuthController.getUser.bind(googleAuthController));


    
export default router;