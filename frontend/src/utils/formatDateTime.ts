export const formatDateTime = (date: Date | string, onlyDate = false) => {
  if (!date) return "";
  if (onlyDate) {
    return new Date(date).toLocaleDateString("pt-BR");
  }
  return new Date(date).toLocaleString("pt-BR");
};
