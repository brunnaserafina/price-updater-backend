import { cannotUpdateProductError } from "@/errors/cannot-update-product-error";
import { InterfaceProcessProduct, InterfaceProductCsv } from "./../protocols";
import productsRepository from "@/repositories/products-repository";
import { validateAndConvertCsvToJson } from "@/utils/validate-csv-and-convert-json";

function checkPriceWithinPercentMargin(newPrice: number, olderPrice: number): string {
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

function checkProductIsPackage(allProducts: InterfaceProductCsv[], new_price: number, productIsPackage): string {
  const productMap = new Map<number, number>();

  for (const packageItem of productIsPackage) {
    const productId = Number(packageItem.product_id);
    const quantity = Number(packageItem.qty);

    const matchingProducts = allProducts.filter((p) => Number(p.product_code) === productId);

    if (matchingProducts.length === 0) {
      return `O produto é um pacote, portanto deve-se indicar a alteração do preço de todos os seus componentes (códigos ${productIsPackage
        .map((item) => item.product_id)
        .join(", ")}) no arquivo csv`;
    }

    for (const product of matchingProducts) {
      const productPrice = Number(product.new_price);
      const totalPrice = productPrice * quantity;

      if (!productMap.has(productId)) {
        productMap.set(productId, totalPrice);
      } else {
        productMap.set(productId, productMap.get(productId) + totalPrice);
      }
    }
  }

  let totalPriceProductsInPackage = 0;
  for (const totalPrice of productMap.values()) {
    totalPriceProductsInPackage += totalPrice;
  }

  if (totalPriceProductsInPackage !== new_price) {
    return "A soma dos valores de venda dos produtos não totaliza o preço do pacote";
  }

  return "";
}

function checkProductContainsInPackage(allProducts: InterfaceProductCsv[], productContainInPackage): string {
  const matchingProducts = allProducts.filter(
    (p) => Number(p.product_code) === Number(productContainInPackage.pack_id),
  );

  if (matchingProducts.length === 0) {
    return "O item faz parte de um pacote, portanto o arquivo csv deve indicar também a alteração do valor do pacote";
  }

  return "";
}

async function processProduct(product: InterfaceProductCsv, allProducts): Promise<InterfaceProcessProduct> {
  const new_price = Number(product.new_price);
  const product_code = Number(product.product_code);

  const findProduct = await productsRepository.findProductByCode(product_code);

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
    messageError = checkPriceWithinPercentMargin(new_price, Number(findProduct.sales_price));
  }

  if (messageError.length === 0) {
    const productIsPackage = await productsRepository.findPackageByProductCode(product_code);
    const productContainInPackage = await productsRepository.findProductsInPackages(product_code);

    if (productIsPackage.length > 0) {
      messageError = checkProductIsPackage(allProducts, new_price, productIsPackage);
    }

    if (productContainInPackage) {
      messageError = checkProductContainsInPackage(allProducts, productContainInPackage);
    }
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
      return processProduct(product, fileData);
    }),
  );

  return allProducts;
}

async function updateProducts(csvData: Buffer): Promise<void> {
  const fileData = await validateAndConvertCsvToJson(csvData);

  const allProducts = await Promise.all(
    fileData.map(async (product) => {
      return processProduct(product, fileData);
    }),
  );

  const containValidateError = allProducts.filter((product) => product.message_error);

  if (containValidateError.length > 0) {
    throw cannotUpdateProductError();
  } else {
    await Promise.all(
      allProducts.map(async (product) => {
        return productsRepository.updateSalesPriceByProductCode(product.product_code, product.new_price);
      }),
    );
  }
}

const uploadsService = { checkProductsCodeAndPricesIsValid, updateProducts };

export default uploadsService;
