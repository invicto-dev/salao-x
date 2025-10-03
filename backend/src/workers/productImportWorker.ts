import { Worker, Job } from "bullmq";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { prisma } from "../config/database";
import { redisConnection } from "../lib/queue";
import { ProductService } from "../services/ProductService";

const worker = new Worker(
  "product-import-queue",
  async (job: Job) => {
    const { jobId } = job.data;
    console.log(`[Worker] Iniciando processamento do Job ID: ${jobId}`);

    try {
      const importJob = await prisma.importJob.findUnique({
        where: { id: jobId },
      });
      if (!importJob) {
        throw new Error(`Job com ID ${jobId} não encontrado.`);
      }

      await prisma.importJob.update({
        where: { id: jobId },
        data: { status: "PROCESSANDO" },
      });

      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "tmp",
        "uploads",
        importJob.storedFilename
      );
      const results: { row: number; errors: string[] }[] = [];
      let successfulRows = 0;
      let failedRows = 0;
      let processedRows = 0;
      let totalRows = 0;

      const parser = fs.createReadStream(filePath).pipe(csv());

      for await (const row of parser) {
        totalRows++;
        const currentRow = totalRows + 1;

        try {
          if (!row.nome || row.nome.trim() === "") {
            throw new Error(
              'A coluna "nome" é obrigatória e não pode estar vazia.'
            );
          }

          let categoriaId: string | undefined = undefined;
          if (row.categoria_nome && row.categoria_nome.trim() !== "") {
            const categoryName = row.categoria_nome.trim();
            let category = await prisma.category.findFirst({
              where: { nome: { equals: categoryName, mode: "insensitive" } },
            });

            if (!category) {
              category = await prisma.category.create({
                data: { nome: categoryName, ativo: true },
              });
            }
            categoriaId = category.id;
          }

          const productPayload: any = {
            nome: row.nome.trim(),
            codigo: row.codigo || null,
            preco: row.preco ? parseFloat(row.preco) : null,
            custo: row.custo ? parseFloat(row.custo) : null,
            unidadeMedida: row.unidade_medida || "un",
            estoqueMinimo: row.estoque_minimo
              ? parseInt(row.estoque_minimo, 10)
              : 1,
            categoriaId: categoriaId,
            descricao: row.descricao || null,
            estoqueInicial: row.estoque_inicial
              ? parseInt(row.estoque_inicial, 10)
              : 0,
            user: { id: importJob.createdByUserId! },
          };

          await ProductService.create(productPayload);

          successfulRows++;
        } catch (error: any) {
          console.error(error);
          results.push({ row: currentRow, errors: [error.message] });
        } finally {
          processedRows++;
        }
      }

      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: failedRows > 0 ? "CONCLUIDO_COM_ERROS" : "CONCLUIDO",
          totalRows,
          processedRows,
          successfulRows,
          failedRows,
          results: results,
          completedAt: new Date(),
        },
      });

      console.log(
        `[Worker] Finalizado processamento do Job ID: ${jobId}. Sucesso: ${successfulRows}, Falhas: ${failedRows}`
      );
    } catch (error: any) {
      console.error(
        `[Worker] Erro crítico ao processar Job ID: ${jobId}`,
        error
      );
      await prisma.importJob.update({
        where: { id: jobId },
        data: { status: "FALHOU", results: { error: error.message } },
      });
    }
  },
  { connection: redisConnection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} foi concluído com sucesso!`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro: ${err.message}`);
});

console.log("🚀 Worker de importação de produtos iniciado e ouvindo a fila...");
