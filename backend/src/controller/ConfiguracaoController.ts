// ARQUIVO REFATORADO
import { Request, Response } from "express";
import { SettingsService } from "../services/SettingsService";

export class ConfiguracaoController {
  static async getConfig(req: Request, res: Response) {
    const config = await SettingsService.get();
    res.status(200).json({ success: true, data: config });
  }

  static async createConfig(req: Request, res: Response) {
    const payload: Settings.Payload = req.body;

    const newConfig = await SettingsService.create(payload);

    res.status(201).json({ success: true, data: newConfig });
  }

  static async updateConfig(req: Request, res: Response) {
    const { id } = req.params;
    const payload: Settings.Payload = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Nenhum ID fornecido" });
    }

    const updatedConfig = await SettingsService.update(id, payload);

    res.status(200).json({ success: true, data: updatedConfig });
  }
}
