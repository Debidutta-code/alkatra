import multer from "multer";

const upload = multer({
  storage: multer.diskStorage({
    destination: `public/uploads`,
    filename: (req, file, cb) => {
      // Define the filename for the uploaded file
      cb(null, file.originalname + Date.now() + "-");
    },
  }),
  limits: {
    fileSize: 10000000,
  },
});

export default upload;
