import { Router } from "express";
import ameniteRoute from "./routes/amenite.route";
import propertyRoute from "./routes/property.route";
import roomRoute from "./routes/room.route";
import uploadRoute from "./routes/upload.route";
import dataSourceRoute from "./routes/dataSource.route";

export default () => {
  const app = Router();
  ameniteRoute(app);
  propertyRoute(app);
  roomRoute(app);
  uploadRoute(app);
  dataSourceRoute(app);

  return app;
};
