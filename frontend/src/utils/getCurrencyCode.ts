import axios from "axios";

const http = axios.create({
  baseURL: "https://brasilapi.com.br/api/cambio/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCurrencyCode = async () => {
  const response = await http.get("/moedas");
  return response.data;
};
