import { Request, Response } from 'express';
import { ARIService } from '../services/ari.service';
import { ARIPayload } from '../interfaces/ari.interface';

export class ARIController {
  private service: ARIService;

  constructor() {
    this.service = new ARIService();
  }

  /**
   * Handle incoming ARI data from QuotusPMS
   * POST /api/v1/quotus-pms/ari
   */
  async handleARIUpdate(req: Request, res: Response): Promise<void> {
    try {
      console.log('\n========================================');
      console.log('📥 ARI Update Received from QuotusPMS');
      console.log('========================================');
      
      const ariPayload: ARIPayload = req.body;

      if (!ariPayload) {
        res.status(400).json({
          success: false,
          message: 'ARI payload is required',
          error: 'Missing request body'
        });
        return;
      }

      console.log('Property Code:', ariPayload.propertyCode);
      console.log('Property Name:', ariPayload.propertyName);
      console.log('Timestamp:', ariPayload.timestamp);
      console.log('Inventory Items:', ariPayload.inventory?.length || 0);

      // Process ARI data
      const result = await this.service.processARIData(ariPayload);

      if (result.success) {
        console.log('\n✅ ARI Update Processed Successfully');
        console.log('- Dates Processed:', result.datesProcessed?.length || 0);
        console.log('- Rate Plans Processed:', result.ratePlansProcessed || 0);
        console.log('- Inventory Records:', result.inventoryRecordsProcessed || 0);
        console.log('========================================\n');

        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            propertyCode: result.propertyCode,
            datesProcessed: result.datesProcessed,
            ratePlansProcessed: result.ratePlansProcessed,
            inventoryRecordsProcessed: result.inventoryRecordsProcessed
          }
        });
      } else {
        console.log('\n❌ ARI Update Failed');
        console.log('Errors:', result.errors);
        console.log('========================================\n');

        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors
        });
      }
    } catch (error: any) {
      console.error('\n❌ ARI Controller Error:', error);
      console.log('========================================\n');

      res.status(500).json({
        success: false,
        message: 'Internal server error while processing ARI data',
        error: error.message
      });
    }
  }

  /**
   * Get ARI data for a property (for debugging/testing)
   * GET /api/v1/quotus-pms/ari/:propertyCode
   */
  async getPropertyARIData(req: Request, res: Response): Promise<void> {
    try {
      const { propertyCode } = req.params;

      if (!propertyCode) {
        res.status(400).json({
          success: false,
          message: 'Property code is required'
        });
        return;
      }

      const data = await this.service.getPropertyARIData(propertyCode);

      res.status(200).json({
        success: true,
        message: 'ARI data retrieved successfully',
        data
      });
    } catch (error: any) {
      console.error('Get ARI Data Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve ARI data',
        error: error.message
      });
    }
  }
}
