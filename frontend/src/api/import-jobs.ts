import http from "./http";

export interface JobStatus {
  id: string;
  status:
    | "PENDENTE"
    | "PROCESSANDO"
    | "CONCLUIDO"
    | "CONCLUIDO_COM_ERROS"
    | "FALHOU";
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  results?: { row: number; errors: string[] }[];
}

export const getImportJob = async (jobId: string): Promise<JobStatus> => {
  const { data } = await http.get(`/jobs/${jobId}`);
  return data.data;
};
