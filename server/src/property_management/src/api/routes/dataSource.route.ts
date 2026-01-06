import { Router } from "express";
import { getDataSourceProviders, getDataSourceTypes } from "../../controller/dataSourceProvider.controller";

const router = Router();

export default (app: Router) => {
  app.use("/data-sources", router);

  // Data source provider routes
  router.route("/types").get(getDataSourceTypes);
  router.route("/providers").get(getDataSourceProviders);
};