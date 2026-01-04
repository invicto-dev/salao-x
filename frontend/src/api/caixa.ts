import http from "./http";

export const hasOpenCaixa = async (): Promise<Caixa.Props | null> => {
  const response = await http.get("/caixa/aberto");
  return response.data.data;
};

export const openCaixa = async (body: Caixa.BodyOpen): Promise<Caixa.Props> => {
  const response = await http.post("/caixa/abrir", body);
  return response.data.data;
};

export const closeCaixa = async (
  body: Caixa.BodyClose
): Promise<Caixa.Props> => {
  const response = await http.post("/caixa/fechar", body);
  return response.data.data;
};

export const moveCaixa = async (
  body: Caixa.BodyMoveCaixa
): Promise<Caixa.Props> => {
  const response = await http.post("/caixa/movimentar", body);
  return response.data.data;
};

export const getCaixaSummary = async (): Promise<Caixa.SummaryResponse> => {
  const response = await http.get("/caixa/aberto/summary");
  return response.data.data;
};

export const getCaixas = async (): Promise<Caixa.Props[]> => {
  const response = await http.get("/caixa");
  return response.data.data;
};
