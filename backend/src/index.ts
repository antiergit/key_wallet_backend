import { Server as HTTPServer, createServer } from "http";
import express, { NextFunction, Request, Response } from "express";
// import { InfoMessages } from "./constants";
import { ServerInterface } from "./interfaces/server.interface";
import controllers from "./modules/controllers.index";
import cors from "cors";
import path from "path";
import expressFileUploader from "express-fileupload";
import { config } from "./config";
// import OS from "os";
// var CryptoJS = require("crypto-js");
// import CryptoJS from "react-native-crypto-js";
// import commonHelper from "./helpers/common/common.helpers";
// import response from "./helpers/response/response.helpers";
import helmet from "helmet";
import { encryptionMiddleware } from "./middlewares/encryption.middleware";
import { ValidationError, Joi } from 'express-validation';
import { GlblCode, GlblMessages, InfoMessages } from "./constants/global_enum";
import ApiLimiter from "./middlewares/apiRateLimiter";
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const basicAuth = require('express-basic-auth');

class Server implements ServerInterface {
  public app: express.Application;
  public httpServer: HTTPServer;

  constructor() {
    this.app = express();

    this.app.use(expressFileUploader());
    this.httpServer = createServer(this.app);
    this.app.use(helmet());
    this.app.use(helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "frame-ancestors": "'none'",
      },
    }));
    this.app.use(helmet.dnsPrefetchControl());
    this.app.use(helmet.expectCt());
    this.app.use(helmet.frameguard({
      action: "deny",
    }));
    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.hsts());
    this.app.use(helmet.ieNoOpen());
    this.app.use(helmet.noSniff());
    this.app.use(helmet.permittedCrossDomainPolicies());
    this.app.use(helmet.referrerPolicy());
    // this.app.use(helmet.xssFilter());

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Strict-Transport-Security", " max-age=31536000; includeSubDomains");
      next();
    });

    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(cors());
    this.app.use(
      `/api/v1/static`,
      express.static(path.join(__dirname, "public"))
    );
    this.app.use(express.static(path.join(__dirname, 'public')))
    this.app.set('views', './views');
    this.app.use(encryptionMiddleware);
    this.app.use(ApiLimiter);
    this.initializeControllers();

    // Basic authentication middleware for Swagger UI
    this.app.use('/KU8S5Ln7siecCst', basicAuth({
      users: { 'dJVMRqXSW7i5c8G': '8o8qoWbnSG4FlZc' }, // Set your username and password here
      challenge: true, // Shows the login prompt
      unauthorizedResponse: 'Unauthorized access', // Response message if unauthorized
    }));
    this.app.use('/KU8S5Ln7siecCst', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


    this.startServer();
    this.checkHealth();


    this.app.use(function (
      err: any,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      // console.log("req.body>>>",err.message)
      console.error('err >>>>>> ', err.details);
      if (err instanceof ValidationError) {
        return res.status(err.statusCode).json({
          statusCode: err.statusCode,
          message: err.message,
          name: err.name,
          error: err.error
        });
      }
      return res.status(GlblCode.NOT_FOUND).json(
        {
          statusCode: GlblCode.NOT_FOUND,
          message: GlblMessages.CATCH_MSG
        }
      );
    });
  }

  public startServer() {
    this.httpServer.listen(config.PORT, () => {
    });
    this.app.get("/", (req: Request, res: Response) => {
      res.send(InfoMessages.APP_INFO).status(GlblCode.SUCCESS);
    });
    this.app.get('/transaction-success', function (req, res) {
      res.sendFile(__dirname + '/views/index.html')
    });

    // Light
    this.app.get('/privacy', function (req, res) {
      res.sendFile(__dirname + '/public/pdf/web-privacy-policy-light.html');
    });
    this.app.get('/terms-and-conditions', function (req, res) {
      res.sendFile(__dirname + '/public/pdf/web-terms-and-conditions-light.html');
    });
    this.app.get('/about-us', function (req, res) {
      res.sendFile(__dirname + '/public/pdf/novaTide-about-us-light.html');
    });

    //Dark
    this.app.get('/privacy/dark', function (req, res) {
      res.sendFile(__dirname + '/public/pdf/web-privacy-policy-dark.html');
    });
    this.app.get('/terms-and-conditions/dark', function (req, res) {
      res.sendFile(__dirname + '/public/pdf/web-terms-and-conditions-dark.html');
    });
    this.app.get('/about-us/dark', function (req, res) {
      res.sendFile(__dirname + '/public/pdf/novaTide-about-us-dark.html');
    });

    this.app.get("/apple-app-site-association", (req, res) => {
      res.set('Content-Type', 'application/pkcs7-mime');
      res.status(200);
      res.sendFile(__dirname + "/apple-app-site-association")
    })
    process.on('uncaughtException', function (err) {
      console.log('Caught exception >>>>' + err);
    });

  }

  public initializeControllers() {
    const url: string = `/api/v1`;
    console.log(
      "\n\n\n🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪",
      url,
      "🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪\n"
    );

    controllers.forEach((controller) => {
      this.app.use(url, controller.router);
    });
  }

  public checkHealth() {
    this.app.use("/", (req: Request, res: Response, next: NextFunction) => {
      const healthcheck: any = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
      };
      try {
        res.status(200).send(healthcheck);
      } catch (error) {
        healthcheck.message = error;
        res.status(503).send();
      }
    })
  }
}

new Server();
