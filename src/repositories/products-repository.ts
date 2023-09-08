import { prisma } from "@/config/database";
import { packs, products } from "@prisma/client";

export async function findProductByCode(code: number): Promise<products> {
  return prisma.products.findFirst({ where: { code } });
}

export async function updateSalesPriceByProductCode(code: number, newPrice: number): Promise<products> {
  return prisma.products.update({
    where: {
      code,
    },
    data: {
      sales_price: newPrice,
    },
  });
}

export async function findPackageByProductCode(code: number): Promise<packs[]> {
  return prisma.packs.findMany({ where: { pack_id: code } });
}

export async function findProductsInPackages(code: number): Promise<packs> {
  return prisma.packs.findFirst({ where: { product_id: code } });
}
