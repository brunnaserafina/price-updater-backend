import { InterfaceProcessProduct, InterfaceProductCsv } from "./../protocols";
import csv from "csvtojson";
import { findProductByCode, updateSalesPriceByProductCode } from "@/repositories/products-repository";
import { cannotUpdateProductError } from "@/errors/cannot-update-product-error";
import { invalidHeadersCsvError } from "@/errors/invalid-headers-csv-error";
import { invalidDataCsvError } from "@/errors/invalid-data-csv-error";

async function validateAndConvertCsvToJson(buffer: Buffer) {
  const jsonArray = await csv().fromString(buffer.toString());

  if (jsonArray.length === 0) {
    throw invalidDataCsvError();
  }

  const expectedHeaders = ["product_code", "new_price"];
  const csvHeaders = Object.keys(jsonArray[0]);
  
  if (JSON.stringify(csvHeaders) !== JSON.stringify(expectedHeaders)) {
    throw invalidHeadersCsvError();
  }

  return jsonArray;
}

function isPriceWithinPercentMargin(newPrice: number, olderPrice: number): string {
  const percentMargin = 0.1; //10%

  const adjustmentGreaterThan10Percent = newPrice > olderPrice + olderPrice * percentMargin;
  const adjustmentLessThan10Percent = newPrice < olderPrice - olderPrice * percentMargin;

  if (adjustmentGreaterThan10Percent) {
    return "O ajuste do preço do produto não pode ser maior que 10%";
  } else if (adjustmentLessThan10Percent) {
    return "O ajuste do preço do produto não pode ser menor que 10%";
  } else {
    return "";
  }
}

async function processProduct(product: InterfaceProductCsv): Promise<InterfaceProcessProduct> {
  const new_price = Number(product.new_price);
  const product_code = Number(product.product_code);

  const findProduct = await findProductByCode(product_code);

  let messageError = "";

  if (!findProduct || !product_code) {
    messageError = "Código do produto inválido";
  } else if (!new_price) {
    messageError = "Novo preço inválido";
  } else if (new_price === Number(findProduct.sales_price)) {
    messageError = "O preço não foi alterado";
  } else if (new_price < Number(findProduct.cost_price)) {
    messageError = "O preço de venda não pode ser menor que o preço de custo";
  } else {
    messageError = isPriceWithinPercentMargin(new_price, Number(findProduct.sales_price));
  }

  const processedProduct = {
    product_code: product_code,
    new_price: new_price,
    name: findProduct?.name.toString(),
    cost_price: Number(findProduct?.cost_price),
    sales_price: Number(findProduct?.sales_price),
  };

  if (messageError.length > 0) {
    return {
      ...processedProduct,
      message_error: messageError,
    };
  }

  return processedProduct;
}

async function checkProductsCodeAndPricesIsValid(csvData: Buffer): Promise<InterfaceProcessProduct[]> {
  const fileData = await validateAndConvertCsvToJson(csvData);

  const allProducts = await Promise.all(
    fileData.map(async (product) => {
      return processProduct(product);
    }),
  );

  return allProducts;
}

async function updateProducts(csvData: Buffer): Promise<void> {
  const fileData = await validateAndConvertCsvToJson(csvData);

  const allProducts = await Promise.all(
    fileData.map(async (product) => {
      return processProduct(product);
    }),
  );

  const containValidateError = allProducts.filter((product) => product.message_error);

  if (containValidateError.length > 0) {
    throw cannotUpdateProductError();
  } else {
    await Promise.all(
      allProducts.map(async (product) => {
        return updateSalesPriceByProductCode(product.product_code, product.new_price);
      }),
    );
  }
}

export const uploadsService = { checkProductsCodeAndPricesIsValid, updateProducts };
