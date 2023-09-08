import { FileRequest } from "./../middlewares/csv-validate-middleware";
import { Response } from "express";
import httpStatus from "http-status";
import { uploadsService } from "@/services/uploads-service";

export async function productsValidation(req: FileRequest, res: Response) {
  try {
    const csvData = req.buffer;

    const validateDataProducts = await uploadsService.checkProductsCodeAndPricesIsValid(csvData);

    const productsWithErrors = validateDataProducts.filter((product) => product.message_error);

    if (productsWithErrors.length > 0) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(validateDataProducts);
    }

    return res.status(httpStatus.OK).json(validateDataProducts);
  } catch (error) {
    if (error.name === "InvalidHeadersCsvError" || error.name === "InvalidDataCsvError") {
      return res.status(httpStatus.BAD_REQUEST).send({ message: error.message });
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

export async function productsUpdate(req: FileRequest, res: Response) {
  try {
    const csvData = req.buffer;

    await uploadsService.updateProducts(csvData);

    return res.status(httpStatus.CREATED).send({ message: "Produtos atualizados com sucesso!" });
  } catch (error) {
    if (error.name === "CannotUpdateProductError") {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({ message: error.message });
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}
