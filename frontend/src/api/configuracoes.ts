import http from "./http";

export const getConfiguracoes = async (): Promise<Salon.Config> => {
  const response = await http.get("/configuracoes");
  return response.data.data;
};

export const updateConfiguracoes = async ({
  body,
  id,
}: {
  id: string;
  body: Salon.Config;
}): Promise<Salon.Config> => {
  const response = await http.patch(`/configuracoes/${id}`, body);
  return response.data;
};
