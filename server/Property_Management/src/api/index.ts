import { Router } from "express";
import ameniteRoute from "./routes/amenite.route";
import propertyRoute from "./routes/property.route";
import roomRoute from "./routes/room.route";
import uploadRoute from "./routes/upload.route";

export default () => {
  const app = Router();
  ameniteRoute(app);
  propertyRoute(app);
  roomRoute(app);
  uploadRoute(app);

  return app;
};
