import express from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./config/database";
import { PORT, NODE_ENV } from "./config/database";
import { settingsRoutes } from "./routes/configuracoes";
import { employeeRoutes } from "./routes/funcionarios";
import { customerRoutes } from "./routes/customers";
import { serviceRoutes } from "./routes/services";
import { productRoutes } from "./routes/products";
import { paymentMethodRoutes } from "./routes/paymentMethods";
import { categoryRoutes } from "./routes/categories";
import { salesRoutes } from "./routes/sales";
import { errorHandler } from "./middlewares/errorHandler";
import { stockRoutes } from "./routes/stock";

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin:
      NODE_ENV == "development"
        ? process.env.FRONTEND_URL_DEV
        : process.env.FRONTEND_URL_PRD,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutos
  max: 100, // máximo 100 requests por IP
  message: "Muitas tentativas, tente novamente em 1 minutos",
});
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    frontendUrl:
      NODE_ENV == "development"
        ? process.env.FRONTEND_URL_DEV
        : process.env.FRONTEND_URL_PRD,
  });
});

app.use("/api/configuracoes", settingsRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/stock", stockRoutes);

// Middleware para tratar erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Rota não encontrada",
  });
});

// Inicializar servidor
async function startServer() {
  try {
    // Conectar ao banco
    await prisma.$connect();
    console.log("✅ Conectado ao banco de dados");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${NODE_ENV}`);
      console.log(`🌐 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
