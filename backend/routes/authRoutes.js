import express from 'express';
import {
    registerLogIn,
    authLogIn,
    verifyEmail,
    profile,
    serviceProviderSearch,
    registerServiceProvider
} from '../controller/authController.js';
import { body } from 'express-validator';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, profile);

router.get('/serviceProviderSearch', protect, serviceProviderSearch);

router.post(
    '/register-service-receiver',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').not().isEmpty(),
    ],
    registerLogIn
);

router.post(
    '/register-service-provider',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').not().isEmpty(),
    ],
    registerServiceProvider
);

router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').not().isEmpty(),
    ],
    authLogIn
);

router.get('/verify-email', verifyEmail);

export default router;
