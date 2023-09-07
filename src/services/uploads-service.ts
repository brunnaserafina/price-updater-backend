import csv from "csvtojson";
import { findProductByCode } from "@/repositories/products-repository";

async function convertFromCsvToJson(buffer) {
  const jsonArray = await csv().fromString(buffer.toString());
  return jsonArray;
}

function isPriceWithinPercentMargin(newPrice, olderPrice) {
  const percentMargin = 0.1; //10%

  const adjustmentGreaterThan10Percent = newPrice > olderPrice + olderPrice * percentMargin;
  const adjustmentLessThan10Percent = newPrice < olderPrice - olderPrice * percentMargin;

  if (adjustmentGreaterThan10Percent) {
    return "O ajuste do preço do produto não pode ser maior que 10%";
  }

  if (adjustmentLessThan10Percent) {
    return "O ajuste do preço do produto não pode ser menor que 10%";
  }

  return "";
}

async function processProduct(product) {
  const { product_code, new_price } = product;

  const findProduct = await findProductByCode(product_code);

  let messageError = "";

  if (!findProduct) {
    messageError = "Código do produto inválido!";
  } else if (!new_price) {
    messageError = "Novo preço inválido.";
  } else if (Number(new_price) < Number(findProduct.cost_price)) {
    messageError = "O preço de venda não pode ser menor que o preço de custo.";
  } else {
    messageError = isPriceWithinPercentMargin(Number(new_price), Number(findProduct.sales_price));
  }

  if (messageError.length > 0) {
    return {
      product_code,
      new_price,
      message_error: messageError,
    };
  }

  return {
    product_code,
    new_price,
    name: findProduct.name,
    cost_price: findProduct.cost_price,
    sales_price: findProduct.sales_price,
  };
}

export async function checkProductsCodeAndPricesIsValid(buffer) {
  const fileData = await convertFromCsvToJson(buffer);

  const allProducts = await Promise.all(
    fileData.map(async (product) => {
      return processProduct(product);
    }),
  );

  return allProducts;
}
