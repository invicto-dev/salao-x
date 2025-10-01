declare global {
  namespace Asaas {
    interface ChargePayload {
      customer: string;
      billingType: "BOLETO" | "PIX" | "UNDEFINED";
      dueDate: string;
      value?: number;
      installmentCount?: number;
      installmentValue?: number;
      description?: string;
      externalReference?: string;
      interest: { value: number };
      fine: { value: number };
    }
  }
}

export {};
