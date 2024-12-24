import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import crypto from 'crypto';

class CheckerHelper implements OnlyControllerInterface {

    constructor() {
        this.initialize();
    }
    public initialize() { }

    public async getMakerCode() {
        try {
            const timestamp: string = Date.now().toString();
            const randomPart: any = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
            const uniqueCode: string = `${timestamp.slice(-3)}${randomPart.slice(0, 3)}`;
            return uniqueCode.slice(0, 6);
        } catch (err: any) {
            console.error("Error in getMakerCode", err);
            return '000000';
        }
    }


}
export const checkerHelper = new CheckerHelper();