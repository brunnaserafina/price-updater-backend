import { prisma } from "@/config/database";

export async function findProductByCode(code: number) {
  return prisma.products.findFirst({ where: { code } });
}

export async function findPackageByProductCode(code: number) {
  return prisma.packs.findMany({ where: { pack_id: code } });
}
