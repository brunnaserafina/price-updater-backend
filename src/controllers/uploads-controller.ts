import { BufferRequest } from "./../middlewares/csv-validate-middleware";
import { Response } from "express";
import httpStatus from "http-status";
import { checkProductsCodeAndPricesIsValid, updateProductsAndPackages } from "@/services/uploads-service";

export async function productsValidation(req: BufferRequest, res: Response) {
  try {
    const buffer = req.buffer;

    const validateDataProducts = await checkProductsCodeAndPricesIsValid(buffer);

    const productsWithErrors = validateDataProducts.filter((product) => product.message_error);

    if (productsWithErrors.length > 0) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(validateDataProducts);
    }

    return res.status(httpStatus.OK).json(validateDataProducts);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

export async function productsUpdate(req: BufferRequest, res: Response) {
  try {
    const buffer = req.buffer;

    await updateProductsAndPackages(buffer);

    return res.status(httpStatus.CREATED).send({ message: "Produtos atualizados com sucesso!" });
  } catch (error) {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Dados inválidos" });
  }
}
