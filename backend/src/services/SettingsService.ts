import { prisma } from "../config/database";

/**
 * Service responsible for managing system settings.
 *
 * Provides methods to retrieve and update configuration values.
 * Handles special business logic such as encrypting sensitive keys
 * before storing them in the database.
 */
export class SettingsService {
  /**
   * Retrieves the first settings record found in the database.
   *
   * @returns The system settings.
   * @throws If no settings record is found.
   */
  static async get() {
    const settings = await prisma.setting.findFirst();
    if (!settings) {
      throw new Error("No settings found");
    }

    return settings;
  }

  /**
   * Creates a new
   *
   */

  static async create(payload: Settings.Payload) {
    const newSettings = await prisma.setting.create({
      data: payload,
    });

    return newSettings;
  }

  /**
   * Updates system settings by ID with the provided payload.
   *
   * @param id - The settings record ID.
   * @param payload - The update payload containing configuration values.
   * @returns The updated settings.
   * @throws If no settings record is found for the given ID.
   */
  static async update(id: string, payload: Settings.Payload) {
    const updatedSettings = await prisma.setting.update({
      where: { id },
      data: payload,
    });

    if (!updatedSettings) {
      throw new Error("Could not find settings with the provided ID");
    }

    return updatedSettings;
  }
}
