export const formatSaleId = (saleId: string) => {
  if (!saleId) return "";
  return `#${saleId.substring(0, 8)}`;
};
