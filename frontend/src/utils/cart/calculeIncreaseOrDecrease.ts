export const calPercentual = (value: number, item: Sale.increaseOrDecrease) => {
  if (!item?.type || item?.value <= 0) return 0;
  return item.type === "PORCENTAGEM" ? (value * item.value) / 100 : item.value;
};
