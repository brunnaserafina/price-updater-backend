import { prisma } from "@/config/database";

export async function findProductByCode(code: number) {
  return prisma.products.findFirst({ where: { code } });
}

export async function updateSalesPriceByProductCode(code: number, newPrice: number) {
  return prisma.products.update({
    where: {
      code,
    },
    data: {
      sales_price: newPrice,
    },
  });
}

export async function findPackageByProductCode(code: number) {
  return prisma.packs.findMany({ where: { pack_id: code } });
}

export async function findProductsInPackages(code: number) {
  return prisma.packs.findFirst({ where: { product_id: code } });
}

