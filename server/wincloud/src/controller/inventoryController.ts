import { InventoryService } from "../service/inventoryService";
import { Request, Response } from 'express';

export class InventoryController {
  private service: InventoryService;

  constructor() {
    this.service = new InventoryService();
  }

  async handleInventoryUpdate(req: Request, res: Response): Promise<void> {
    try {
      const xml = req.body;
      console.log('##################\nController Received XML:', xml);
      if (!xml || typeof xml !== 'string') {
        res.status(400).json({ error: 'Invalid XML payload' });
        return;
      }

      await this.service.processInventoryXml(xml);
      res.status(200).json({ message: 'Inventory updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}