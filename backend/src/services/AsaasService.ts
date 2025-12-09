import axios, { AxiosInstance } from "axios";
import { Customer } from "@prisma/client";
import { SettingsService } from "./SettingsService";

/**
 * Service responsible for integrating with the Asaas payment API.
 *
 * Provides methods to:
 * - Manage customers (create or fetch)
 * - Create and cancel charges
 * - Update external references for charges
 *
 * Ensures the latest API settings (API key, environment) are always retrieved
 * dynamically from the database before each request.
 */
export class AsaasService {
  /**
   * Creates and configures a dynamic Axios instance for communicating with Asaas.
   *
   * - Fetches the latest API settings from the database
   * - Applies correct base URL depending on the environment
   * - Sets required headers (User-Agent, Content-Type, access_token)
   *
   * @private
   * @returns An Axios instance configured for Asaas API.
   * @throws If the API key is missing or the API URL is not found in environment variables.
   */
  private static async getApiInstance(): Promise<AxiosInstance> {
    const settings = await SettingsService.get();

    if (!settings.asaasApiKey) {
      throw new Error("Asaas API key is not configured in the system.");
    }

    const baseURL =
      settings.asaasEnvironment === "sandbox"
        ? process.env.ASAAS_API_URL_SANDBOX
        : process.env.ASAAS_API_URL;

    if (!baseURL) {
      throw new Error(
        "Asaas API URL was not found in environment variables (ASAAS_API_URL or ASAAS_API_URL_SANDBOX)."
      );
    }

    return axios.create({
      baseURL,
      headers: {
        "User-Agent": settings.nomeEmpresa,
        "Content-Type": "application/json",
        access_token: settings.asaasApiKey,
      },
    });
  }

  /**
   * Calculates the correct due date based on the preferred payment day.
   *
   * - If today is past the preferred due day, the date is set for next month.
   *
   * @param paymentDueDay - Preferred day of the month for the payment.
   * @returns The calculated due date.
   */
  private static getDueDate(paymentDueDay: number): Date {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dueYear = currentYear;
    let dueMonth = currentMonth;

    if (currentDay >= paymentDueDay) {
      dueMonth += 1;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear += 1;
      }
    }

    return new Date(dueYear, dueMonth, paymentDueDay);
  }

  /**
   * Ensures that a local customer has a corresponding record in Asaas.
   *
   * - If the customer already has an Asaas ID, it is returned.
   * - Otherwise, searches for the customer in Asaas using CPF.
   * - If not found, creates a new customer in Asaas.
   *
   * @param customer - Local customer entity from the database.
   * @returns The Asaas customer ID.
   * @throws If the customer does not have a CPF or if Asaas communication fails.
   */
  static async getOrCreateCustomer(customer: Customer): Promise<string> {
    if (customer.asaasCustomerId) {
      return customer.asaasCustomerId;
    }

    if (!customer.cpfCnpj) {
      throw new Error("To use credit billing, the customer must have a CPF.");
    }

    if (!customer.paymentDueDay) {
      throw new Error(
        "To use credit billing, the customer must have a payment due day."
      );
    }

    const asaasAPI = await this.getApiInstance();

    try {
      const response = await asaasAPI.get(
        `/customers?cpfCnpj=${customer.cpfCnpj}`
      );
      if (response.data.data.length > 0) {
        return response.data.data[0].id;
      }

      const newAsaasCustomer = {
        name: customer.nome,
        email: customer.email,
        cpfCnpj: customer.cpfCnpj,
        phone: customer.telefone,
      };

      const createResponse = await asaasAPI.post(
        "/customers",
        newAsaasCustomer
      );
      return createResponse.data.id;
    } catch (error: any) {
      console.error(
        "ERROR [AsaasService.getOrCreateCustomer]:",
        error.response?.data
      );
      throw new Error(
        "Failed to communicate with the payment service to sync customer data."
      );
    }
  }

  /**
   * Creates a new charge (invoice/payment) in Asaas.
   *
   * @param asaasCustomerId - The Asaas customer ID.
   * @param paymentValue - The total payment amount.
   * @param paymentDueDay - Preferred due day for the payment.
   * @param installmentCount - Optional: Number of installments.
   * @param interest - Optional: Monthly interest percentage.
   * @param fine - Optional: Fine percentage for late payment.
   * @param billingType - Payment method ("BOLETO", "PIX", or "UNDEFINED").
   *                      Default is "UNDEFINED" (lets customer choose).
   * @returns An object containing the charge ID and invoice URL.
   * @throws If charge creation fails due to communication issues with Asaas.
   */
  static async createCharge(
    saleId: string,
    asaasCustomerId: string,
    paymentValue: number,
    paymentDueDay: number,
    installmentCount?: number,
    interest?: number,
    fine?: number,
    billingType: "BOLETO" | "PIX" | "UNDEFINED" = "UNDEFINED"
  ): Promise<{ id: string; invoiceUrl: string }> {
    const dueDate = AsaasService.getDueDate(paymentDueDay);

    let chargePayload: Asaas.ChargePayload = {
      customer: asaasCustomerId,
      billingType: billingType,
      dueDate: dueDate.toISOString().split("T")[0],
      interest: { value: interest || 2 },
      fine: { value: fine || 1 },
      externalReference: saleId,
      description: `Referente a venda #${saleId}`,
    };

    if (installmentCount && installmentCount > 1) {
      chargePayload.installmentCount = installmentCount;
      chargePayload.installmentValue = Number(
        (paymentValue / installmentCount).toFixed(2)
      );
    } else {
      chargePayload.value = paymentValue;
    }

    try {
      const asaasAPI = await this.getApiInstance();
      const response = await asaasAPI.post("/payments", chargePayload);
      return {
        id: response.data.id,
        invoiceUrl: response.data.invoiceUrl,
      };
    } catch (error: any) {
      console.error("ERROR [AsaasService.createCharge]:", error.response?.data);
      throw new Error(
        "Failed to communicate with the payment service to create the charge."
      );
    }
  }

  /**
   * Cancels an existing charge in Asaas.
   *
   * - If the charge cannot be canceled (e.g., already paid),
   *   logs a warning instead of throwing an error.
   *
   * @param chargeId - The charge ID in Asaas.
   * @throws If cancellation fails due to unexpected issues with Asaas.
   */
  static async cancelCharge(chargeId: string): Promise<void> {
    try {
      const asaasAPI = await this.getApiInstance();
      await asaasAPI.delete(`/payments/${chargeId}`);
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.warn(
          `WARNING: Charge ${chargeId} could not be canceled in Asaas (likely already paid or not cancellable).`
        );
        return;
      }
      console.error("ERROR [AsaasService.cancelCharge]:", error.response?.data);
      throw new Error(
        "Failed to communicate with the payment service to cancel the charge."
      );
    }
  }
}
