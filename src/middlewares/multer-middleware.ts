import multer from "multer";

const multerConfig = multer();

const uploadByMulter = multerConfig.single("file");

export { uploadByMulter };
