import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImportJob, JobStatus } from "../api/import-jobs";

export const useImportJobStatus = (jobId: string | null) => {
  return useQuery<JobStatus>({
    queryKey: ["import-job-status", jobId],
    queryFn: () => getImportJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "PENDENTE" || data?.status === "PROCESSANDO") {
        return 3000;
      }

      return false;
    },
  });
};
