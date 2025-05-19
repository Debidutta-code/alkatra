// import dotenv from "dotenv";
// import express, { NextFunction, Request, Response } from "express";
// import cors from "cors";
// import booking from "./routes/booking.routes";

// export const app = express();

// dotenv.config();

// const PORT = process.env.PORT;
// const DB = process.env.MONGO_URI;

// app.use(
//   cors({
//     origin: "http://localhost:3001",
//     credentials: true,
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// app.use("/api/v1/booking", booking);

// app.all("*", (req: Request, _res: Response, next: NextFunction) => {
//   return next(new Error(`Can't find ${req.originalUrl} path on the server`));
// });

// export { PORT, DB };
