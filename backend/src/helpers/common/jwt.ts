import jwt from "jsonwebtoken";
import { config } from "../../config";
import commonHelper from "./common.helpers";
var CryptoJS = require("crypto-js");

class JWT {
  public async createJSONWebToken(userId: number, device_token: string) {
    try {
      let token: any = jwt.sign({ userId, device_token }, config.JWT_SECRET, {
        // expiresIn: "7d", // 7 days
        // expiresIn: 60 * 2, // 2 minutes
        expiresIn: 60 * 60 * 2, // 2 Hrs 
      });
      let Token: string = `JWT ${token}`;
      return CryptoJS.AES.encrypt(Token, config.ENCRYPT_SECRET).toString();

    } catch (err: any) {
      console.error("Error in createJSONWebToken.", err)
      await commonHelper.save_error_logs("createJSONWebToken", err.message);
      throw err;
    }

  }
  public async createJSONRefreshToken(userId: number, device_token: string) {
    try {
      const options = {
        expiresIn: "365d",
        // audience:userId
      };
      const token = jwt.sign(
        { userId, device_token },
        config.REFRESH_SECRET as string,
        options
      );
      let Token: string = `REFRESH ${token}`;
      return CryptoJS.AES.encrypt(Token, config.ENCRYPT_SECRET).toString();
    } catch (err: any) {
      console.error("Error in createJSONRefreshToken.", err)
      await commonHelper.save_error_logs("createJSONRefreshToken", err.message);
      throw err;
    }
  }
  public async create_json_web_token(data: any) {
    const userId: any = data;
    const token: string = await jwt.sign(userId, config.JWT_SECRET);
    let Token: any = `JWT ${token}`;
    return CryptoJS.AES.encrypt(Token, config.ENCRYPT_SECRET).toString();
  }
  public decodeToken = (token: string) => {
    const payload: any = jwt.decode(token);
    return payload as { userId: string; iat: number; exp: number, device_token: string };
  }
  public verify = (token: string) => {
    try {
      jwt.verify(token, config.JWT_SECRET || "");
      return true;
    } catch (error: any) {
      console.error("VERIFY ERROR", error);
      return false;
    }
  }

  public decodeRefreshToken = (token: string) => {
    const payload = jwt.decode(token);

    return payload as {
      userId: string;
      role: number;
      device_id: string;
      device_token: string,
      iat: number;
    };
  }
  public verifyRefreshToken = (token: string) => {
    try {
      const data = jwt.verify(token, config.REFRESH_SECRET || "");
      if (data) {
        const decodedData = this.decodeRefreshToken(token);
        return decodedData;
      }
    } catch (error) {
      return null;
    }
  }
}

const jwtHelper = new JWT();
export default jwtHelper;
