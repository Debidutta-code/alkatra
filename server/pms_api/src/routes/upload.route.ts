import { Router } from "express";
import upload from "../utils/multer";
import { uploadHandler } from "../controller/upload.controller";

const router = Router();

router.route("/").post(upload.array("file"), uploadHandler as any);

export default router;
