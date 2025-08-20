import { Router } from 'express';
import { AuthController } from '../../controllers/googleSocialAuth.controller';

const router = Router();
const authController = new AuthController();

/**
 * API end point for Google authentication
 * It handles both web and mobile token
 */
router.post('/auth/google', authController.postGoogleAuthData.bind(authController));


/**
 * Get the user information by providing JWT token
 */
router.get('/api/user', authController.getUser.bind(authController));

export default router;