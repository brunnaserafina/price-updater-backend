import { BufferRequest } from "./../middlewares/csv-validate-middleware";
import { Response } from "express";
import httpStatus from "http-status";
import { checkProductsCodeAndPricesIsValid } from "@/services/uploads-service";

export async function productsValidation(req: BufferRequest, res: Response) {
  try {
    const buffer = req.buffer;

    const isValidData = await checkProductsCodeAndPricesIsValid(buffer);

    const productsWithErrors = isValidData.filter((product) => product.message_error);
    const productsAccepted = isValidData.filter((product) => !product.message_error);

    if (productsWithErrors) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: productsWithErrors, valids: productsAccepted });
    }

    return res.status(httpStatus.OK).json(isValidData);
  } catch (error) {
    if (error.name === "InvalidFileError") {
      return res.status(httpStatus.UNSUPPORTED_MEDIA_TYPE).send(error.message);
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "arquivo não encontrado" });
  }
}
