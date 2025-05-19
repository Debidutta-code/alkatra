import { Router } from "express";
import upload from "../../utils/multer";
import { uploadHandler } from "../../controller/upload.controller";

const router = Router();

export default (app: Router) => {
  app.use("/upload", router);

  router.route("/").post(upload.array("file"), uploadHandler as any);
};
