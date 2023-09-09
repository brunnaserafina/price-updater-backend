import { prisma } from "@/config/database";
import { packs, products } from "@prisma/client";

async function findProductByCode(code: number): Promise<products> {
  return prisma.products.findFirst({ where: { code } });
}

async function updateSalesPriceByProductCode(code: number, newPrice: number): Promise<products> {
  return prisma.products.update({
    where: {
      code,
    },
    data: {
      sales_price: newPrice,
    },
  });
}

async function findPackageByProductCode(code: number): Promise<packs[]> {
  return prisma.packs.findMany({ where: { pack_id: code } });
}

async function findProductsInPackages(code: number): Promise<packs> {
  return prisma.packs.findFirst({ where: { product_id: code } });
}

const productsRepository = {
  findProductByCode,
  updateSalesPriceByProductCode,
  findPackageByProductCode,
  findProductsInPackages,
};

export default productsRepository;
