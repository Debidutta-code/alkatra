import { Router } from "express";
import upload from "../../utils/multer";
// import { uploadHandler } from "../../controller/upload.controller";
import { uploadController } from "../../container";

const router = Router();

export default (app: Router) => {
  app.use("/upload", router);

  // router.route("/").post(upload.array("file"), uploadHandler as any);
  router.route("/").post(upload.array("file"), uploadController.uploadHandler.bind(uploadController) as any);
};
