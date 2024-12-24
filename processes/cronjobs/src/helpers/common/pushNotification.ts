import admin from 'firebase-admin';

const serviceAccount = require('../../../novatidewallet-firebase-adminsdk-2fygp-65dfa7464a.json');

class NotificationHelper {
    private messaging: admin.messaging.Messaging;

    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })
        this.messaging = admin.messaging()
    }

    public sendNotification = async (message: any) => {
        console.log("🚀 ~ NotificationHelper ~ sendNotification= ~ message:", message);
        try {
            let response :any = await this.messaging.sendEachForMulticast(message);
            console.log("💥🚀 ~ firebase admin push notification", response);
            response.responses.forEach((resp: any, idx: any) => {
                if (!resp.success) {
                    console.error(`Error sending notification to device ${message.tokens[idx]}: ${resp.error.message}`);
                    console.error(`Error code: ${resp.error.code}`);
                    console.error(`Error details: ${JSON.stringify(resp.error.details)}`);
                    if (resp.error.code === 'messaging/registration-token-not-registered') {
                        console.log(`Token ${message.tokens[idx]} is not registered, removing from database.`);
                        // removeTokenFromDatabase(message.tokens[idx]); // Implement this function to remove the token from your database
                    } else if (resp.error.code === 'messaging/mismatched-credential') {
                        console.error(`Mismatched credential error for token ${message.tokens[idx]}. Check your Firebase project and Sender ID.`);
                    }
                }
            });
        } catch (err: any) {
            console.error("Error sending notification: 🔥 ~ ~", err.message);
        }
    }
    // public sendNotification = async (message: any) => {
    //     console.log("🚀 ~ NotificationHelper ~ sendNotification= ~ message:", message);
    //     try {
    //         let response: any = await this.messaging.sendEachForMulticast(message);
    //         console.log("💥🚀 ~ firebase admin push notification", response);
    //         response.forEach((resp: any, idx: any) => {
    //             if (!resp.success) {
    //                 console.error(`Error sending notification to device ${message.tokens[idx]}: ${resp.error.message}`);
    //                 console.error(`Error code: ${resp.error.code}`);
    //                 console.error(`Error details: ${JSON.stringify(resp.error.details)}`);
    //                 if (resp.error.code === 'messaging/registration-token-not-registered') {
    //                     console.log(`Token ${message.tokens[idx]} is not registered, removing from database.`);
    //                     // removeTokenFromDatabase(message.tokens[idx]); // Implement this function to remove the token from your database
    //                 } else if (resp.error.code === 'messaging/mismatched-credential') {
    //                     console.error(`Mismatched credential error for token ${message.tokens[idx]}. Check your Firebase project and Sender ID.`);
    //                 }
    //             }
    //         });
    //     } catch (err: any) {
    //         console.error("Error sending notification: 🔥 ~ ~", err.message);
    //     }
    // }

}

const notificationhelper = new NotificationHelper();
export default notificationhelper;