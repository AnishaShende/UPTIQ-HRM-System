import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { 
  authenticateToken,
  authorizeRoles 
} from '@hrm/shared';
import {
  loginValidation,
  registerValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation
} from '../controllers/auth.controller';
import { UserRole } from '@hrm/shared';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/refresh', refreshTokenValidation, authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

// Admin only routes
router.post('/register', 
  authenticateToken, 
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), 
  registerValidation, 
  authController.register
);

// Health check
router.get('/health', authController.healthCheck);

export default router;