import { Router } from "express";
import customerRoutes from "./routes/customerRoutes";

export default () => {
  const app = Router();
  app.use("/customers", customerRoutes); 
  return app;
};