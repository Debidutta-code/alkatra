// import express, { NextFunction, Request, Response } from "express";
// import cors from "cors";
// import morgan from "morgan";
// import { AppError, errorHandler } from "./utils";
// import router from "./routes/payment.route";

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());
// app.use("/payment", router);
// app.use(morgan("dev"));

// const PORT = process.env.PORT;
// const DB = process.env.MONGO_URI;

// app.all("*", (req: Request, _res: Response, next: NextFunction) => {
//   next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
// });

// app.use(errorHandler);

// export { app, PORT, DB };
