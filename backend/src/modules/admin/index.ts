import { Router } from 'express';
import AuthRoute from './auth/router';
import UserRoute from './users/router';
import CommissionRoute from './commission/router';



class AdminRoute {
    public path = '/admin';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use(`${this.path}/auth`, AuthRoute)
        this.router.use(`${this.path}/users`, UserRoute)
        this.router.use(`${this.path}/commission`, CommissionRoute)


    }
}

export default AdminRoute;
