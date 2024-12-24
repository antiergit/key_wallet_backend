import { Router } from 'express';
import { authController } from './controller';
import { validate as validateExpress } from "express-validation"
import adminValidator from './validator';
import adminMiddleware from '../middleware';


const router = Router();


router.post('/login',
    [validateExpress(adminValidator.login)],
    authController.login)

router.get('/logout',
    adminMiddleware.checkLogin,
    authController.logout)

router.get('/googleAuthStatus',
    adminMiddleware.checkLogin,
    authController.googleAuthStatus)

router.get('/googleAuthSecretkey',
    adminMiddleware.checkLogin,
    authController.googleAuthSecretkey)

router.post('/googleAuthEnabledisable',
    [validateExpress(adminValidator.googleAuthEnabledisable)],
    adminMiddleware.checkLogin,
    authController.googleAuthEnabledisable)

router.post(`/google2faVerify`,
    [validateExpress(adminValidator.google2faVerify)],
    adminMiddleware.checkLogin,
    authController.google2faVerify)


router.post(`/changePassword`,
    [validateExpress(adminValidator.changePassword)],
    adminMiddleware.checkLogin,
    authController.changePassword);

// Testing

router.post(`/encryptPassowrd`,
    authController.encryptPassowrd);

export default router;