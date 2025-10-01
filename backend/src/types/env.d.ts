export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT?: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      REDIS_URL?: string;
      TIMEZONE?: string;
      FRONTEND_URL_DEV: string;
      FRONTEND_URL_PRD: string;
      ASAAS_API_KEY: string;
      ASAAS_API_URL: string;
      ASAAS_API_URL_SANDBOX: string;
    }
  }
}
