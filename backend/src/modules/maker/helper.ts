import { config } from "../../config";
import { device_token_queries } from "../../helpers/dbHelper";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import * as Models from '../../models/model/index';
import userhelper from "../user/helper";

class MakerHelper implements OnlyControllerInterface {

    constructor() {
        this.initialize();
    }
    public initialize() { }

    public async insertNotification(makerUserId: number, checkerUserId: number, type: string, message: string, status: number, title: string) {
        try {
            await Models.MakerCheckerNotificationModel.create({
                maker_user_id: makerUserId,
                checker_user_id: checkerUserId,
                type: type,
                message: message,
                view_status: 0,
                status: status,
                notification_status: 1,
                created_at: new Date(),
                updated_at: new Date()
            })
            // Push Notification
            let device_tokens = [];
            if (type == 'makerToChecker') {
                console.log("makerToChecker makerToChecker")

                let deviceData: any = await device_token_queries.device_token_find_all(
                    ["device_token", "user_id"],
                    { user_id: checkerUserId, push: 1 },
                    [["id", "DESC"]]
                )
                for await (let deviceToken of deviceData) {
                    device_tokens.push(deviceToken.device_token);
                }

            } else {
                console.log("checkerToMaker checkerToMaker")

                let makerData: any = await Models.MakerWalletsModel.findOne({
                    attributes: ['device_token'],
                    where: { id: makerUserId },
                    raw: true
                })
                device_tokens.push(makerData.device_token);

            }

            if (device_tokens) {
                let messageData: any = {
                    tokens: device_tokens,
                    collapse_key: "type_a",
                    notification: {
                        title: title,
                        body: message
                    },
                    data: {
                        body: message,
                        title: title,
                        announcement_title: title,
                        announcement_message: message
                    },
                    apns: {
                        payload: {
                            aps: {
                                alert: {
                                    title: title,
                                    body: message
                                },
                                sound: "default",
                                contentAvailable: true
                            }
                        }
                    }
                };
                console.log("adding_coins_to_queue adding_coins_to_queue", messageData)
                await userhelper.adding_coins_to_queue(config.PUSH_NOTIFICATION_QUEUE, messageData)
            }
        } catch (err: any) {
            console.error("Error in insertNotification", err)
        }
    }


}
export const makerHelper = new MakerHelper();