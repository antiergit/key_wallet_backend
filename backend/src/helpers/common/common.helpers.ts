import NodeRSA from "node-rsa";
import fs from "fs";
import { config } from "../../config";
import * as Models from '../../models/model/index';
import dbHelper, { catch_err_msg_queries } from "../dbHelper/index";
class CommonHelper {
  constructor() { }

  public async save_error_logs(fn_name: string, error_message: any) {
    try {
      await catch_err_msg_queries.catch_err_msg_create({ fx_name: fn_name, error_msg: error_message || {} })
    } catch (err: any) {
      console.error("Error in save_error_logs", err)
    }
  }

  public async implement_pagination(data: any, limitNo: number, offset: number) {
    try {
      let start_index: number = offset;
      let end_index: number = start_index + limitNo;
      let pagination_data: any = await data.slice(start_index, end_index)
      return pagination_data;
    } catch (err: any) {
      console.error("Error in implement_pagination>>", err)
      throw err;
    }
  }

  public async decryptDataRSA(data: any) {
    try {
      let privateKeyFile = await fs.readFileSync(`${__dirname}/../../config/keys/${config.RSA_PRIVATE_KEY_NAME}`, { encoding: "utf-8" })
      // console.log('privateKeyFile>>>', privateKeyFile);
      let privateKey = Buffer.from(privateKeyFile);
      let RSAKey = new NodeRSA(privateKey);
      RSAKey.setOptions({ encryptionScheme: 'pkcs1' });
      let decryptedData = await RSAKey.decrypt(data)
      return decryptedData;
    } catch (err: any) {
      console.error("decryptDataRSA error ======== ,", err.message);
      throw new Error(err)
    }
  }
  public async adminDecryptDataRSA(data: any) {
    try {
      let privateKeyFile = await fs.readFileSync(`${__dirname}/../../config/admin_keys/${config.RSA_PRIVATE_KEY_NAME}`, { encoding: "utf-8" })
      let privateKey = Buffer.from(privateKeyFile);
      let RSAKey = new NodeRSA(privateKey);
      RSAKey.setOptions({ encryptionScheme: 'pkcs1' });
      let decryptedData = await RSAKey.decrypt(data)
      return decryptedData;
    } catch (err: any) {
      console.error("adminDecryptDataRSA error ======== ,", err.message);
      throw new Error(err)
    }
  }
  public async encryptDataRSA(data: any) {
    let publicKeyFile: any = fs.readFileSync(`${__dirname}/../../config/keys/${config.RSA_PUBLIC_KEY_NAME}`, { encoding: "utf-8" })
    let publicKey: any = Buffer.from(publicKeyFile);
    let RSAKey: any = new NodeRSA(publicKey);
    RSAKey.setOptions({ encryptionScheme: 'pkcs1' });
    let encryptedData: any = RSAKey.encrypt(data, 'base64');
    return encryptedData;

  }

  public async adminEncryptDataRSA(data: any) {
    try {
      let privateKeyFile = await fs.readFileSync(`${__dirname}/../../config/admin_keys/${config.RSA_PUBLIC_KEY_NAME}`, { encoding: "utf-8" })
      let privateKey = Buffer.from(privateKeyFile);
      let RSAKey = new NodeRSA(privateKey);
      RSAKey.setOptions({ encryptionScheme: 'pkcs1' });
      let decryptedData = await RSAKey.decrypt(data)
      return decryptedData;
    } catch (err: any) {
      console.error("adminEncryptDataRSA error ======== ,", err.message);
      throw new Error(err)
    }
  }

}

const commonHelper = new CommonHelper();
export default commonHelper;
