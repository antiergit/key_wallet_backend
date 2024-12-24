import { Router } from 'express';
import { userController } from './controller';
import { validate as validateExpress } from "express-validation"
import userValidator from './validator';
import adminMiddleware from '../middleware';


const router = Router();


router.post('/getUsersListByCoinFamily',
    [validateExpress(userValidator.getUsersListByCoinFamily)],
    adminMiddleware.checkLogin,
    userController.getUsersListByCoinFamily);

export default router;