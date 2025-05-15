import { Express } from "express";

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { AppError } from "./../utils/appError";
import { errorHandler } from "./../middlewares/error.middleware";
import routes from "./../api";

export default async ({ app }: { app: Express }) => {
  app.get("/status", (req: Request, res: Response) => {
    res.status(200).end();
  });

  app.head("/status", (req: Request, res: Response) => {
    res.status(200).end();
  });

  app.enable("trust proxy");
  // app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  // app.use(morgan("dev"));

  app.use("/api/v1", routes());

  //   app.use("/api/v1/amenite", ameniteRouter);
  //   app.use("/api/v1/property", propertyRouter);
  //   app.use("/api/v1/upload", uploadRouter);
  //   app.use("/api/v1/room", roomRouter);

  app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
  });

  app.use(errorHandler);
};
