import { Router } from "express";
import { uploadByMulter } from "../middlewares/multer-middleware";
import { csvValidateFile } from "../middlewares/csv-validate-middleware";
import { productsUpdate, productsValidation } from "../controllers/uploads-controller";

const uploadsRouter = Router();

uploadsRouter
  .post("/validation", uploadByMulter, csvValidateFile, productsValidation)
  .put("/update", uploadByMulter, csvValidateFile, productsUpdate);

export default uploadsRouter;
