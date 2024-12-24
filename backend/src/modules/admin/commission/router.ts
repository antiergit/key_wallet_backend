import { Router } from 'express';
import { commissionController } from './controller';
import { validate as validateExpress } from "express-validation"
import commissionValidator from './validator';
import adminMiddleware from '../middleware';


const router = Router();


router.get('/getCommissionDetails',
    adminMiddleware.checkLogin,
    commissionController.getCommissionDetails);

router.post('/commissionDetails',
    [validateExpress(commissionValidator.commissionDetails)],
    adminMiddleware.checkLogin,
    commissionController.commissionDetails);

export default router;