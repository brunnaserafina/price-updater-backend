import csv from "csvtojson";
import {
  findPackageByProductCode,
  findProductByCode,
  findProductsInPackages,
  updateSalesPriceByProductCode,
} from "@/repositories/products-repository";

async function convertCsvToJson(buffer) {
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

async function changeProductPriceIfIncludedPackage(new_price, checkProductIsPackage) {
  if (checkProductIsPackage.length === 1) {
    const newPricePackage = Number(new_price);
    const quantityOfProductsPerPack = Number(checkProductIsPackage[0].qty);
    const productId = Number(checkProductIsPackage[0].product_id);

    const newPriceProduct = newPricePackage / quantityOfProductsPerPack;

    await updateSalesPriceByProductCode(productId, newPriceProduct);
  }
}

async function changePackagePriceIfContainsProduct(product_code, new_price, findProduct) {
  const productContainsInPackage = await findProductsInPackages(product_code);

  if (productContainsInPackage) {
    const quantityOfProductsPerPack = Number(productContainsInPackage.qty);
    const newPriceProduct = new_price;
    const olderPriceProduct = Number(findProduct.sales_price);

    const packageId = Number(productContainsInPackage.pack_id);
    const findPackageInfo = findProductByCode(packageId);
    const olderPricePackage = Number((await findPackageInfo).sales_price);

    const newPricePackage =
      olderPricePackage - olderPriceProduct * quantityOfProductsPerPack + newPriceProduct * quantityOfProductsPerPack;

    await updateSalesPriceByProductCode(packageId, newPricePackage);
  }
}

async function processProduct(product, isUpdateDatabase) {
  const { product_code, new_price } = product;

  const findProduct = await findProductByCode(product_code);
  let checkProductIsPackage = null;

  if (findProduct !== null) {
    checkProductIsPackage = await findPackageByProductCode(Number(findProduct.code));
  }

  let messageError = "";

  if (!findProduct || !product_code) {
    messageError = "Código do produto inválido!";
  } else if (!new_price) {
    messageError = "Novo preço inválido.";
  } else if (Number(new_price) === Number(findProduct.sales_price)) {
    messageError = "O preço não foi alterado";
  } else if (checkProductIsPackage.length > 1) {
    messageError =
      "O pacote possui mais de um tipo de item. Para alterar o preço de pacotes que possuem itens diferentes é necessário reajustar o preço do produto, logo o preço do pacote será alterado automaticamente.";
  } else if (Number(new_price) < Number(findProduct.cost_price)) {
    messageError = "O preço de venda não pode ser menor que o preço de custo.";
  } else {
    messageError = isPriceWithinPercentMargin(Number(new_price), Number(findProduct.sales_price));
  }

  if (isUpdateDatabase) {
    changeProductPriceIfIncludedPackage(new_price, checkProductIsPackage);
    changePackagePriceIfContainsProduct(product_code, new_price, findProduct);
  }

  if (messageError.length > 0) {
    return {
      product_code,
      new_price,
      name: findProduct?.name,
      cost_price: findProduct?.cost_price,
      sales_price: findProduct?.sales_price,
      message_error: messageError,
    };
  }

  return {
    product_code,
    new_price,
    name: findProduct?.name,
    cost_price: findProduct?.cost_price,
    sales_price: findProduct?.sales_price,
  };
}

export async function checkProductsCodeAndPricesIsValid(buffer) {
  const fileData = await convertCsvToJson(buffer);
  const isUpdateDatabase = false;

  const allProducts = await Promise.all(
    fileData.map(async (product) => {
      return processProduct(product, isUpdateDatabase);
    }),
  );

  return allProducts;
}

export async function updateProductsAndPackages(buffer) {
  const fileData = await convertCsvToJson(buffer);
  let isUpdateDatabase = false;

  const allProducts = await Promise.all(
    fileData.map(async (product) => {
      return processProduct(product, isUpdateDatabase);
    }),
  );

  const isError = allProducts.filter((product) => product.message_error);

  if (isError.length > 0) {
    isUpdateDatabase = false;
  } else {
    isUpdateDatabase = true;

    const updatedProducts = await Promise.all(
      allProducts.map(async (product) => {
        processProduct(product, isUpdateDatabase);
        return updateSalesPriceByProductCode(product.product_code, product.new_price);
      }),
    );

    return updatedProducts;
  }
}
