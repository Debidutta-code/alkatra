
/**
 * PMS Connection Manager
 * Utility functions to manage property-PMS associations
 */

import { PropertyInfo } from '../property_management/src/model/property.info.model';
import { DataSourceProvider } from '../property_management/src/model/dataSourceProvider.model';

export class PMSConnectionManager {
  /**
   * Connect property to a PMS
   * @param propertyId - Property ID
   * @param pmsName - Name of PMS ('Internal', 'Wincloud', 'QuotusPMS', 'ChannelManager')
   */
  static async connectPropertyToPMS(propertyId: string, pmsName: string): Promise<boolean> {
    try {
      // Find the data source
      const dataSource = await DataSourceProvider.findOne({ name: pmsName });

      if (!dataSource) {
        throw new Error(`PMS '${pmsName}' not found. Please run seed script first.`);
      }

      if (!dataSource.isActive) {
        throw new Error(`PMS '${pmsName}' is not active`);
      }

      // Update property
      const property = await PropertyInfo.findByIdAndUpdate(
        propertyId,
        { $set: { dataSource: dataSource._id } },
        { new: true }
      );

      if (!property) {
        throw new Error(`Property not found: ${propertyId}`);
      }

      console.log(`✅ Property '${property.property_name}' connected to PMS '${pmsName}'`);
      return true;
    } catch (error: any) {
      console.error('Error connecting property to PMS:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect property from PMS (set to null)
   * @param propertyId - Property ID
   */
  static async disconnectPropertyFromPMS(propertyId: string): Promise<boolean> {
    try {
      const property = await PropertyInfo.findByIdAndUpdate(
        propertyId,
        { $unset: { dataSource: 1 } },
        { new: true }
      );

      if (!property) {
        throw new Error(`Property not found: ${propertyId}`);
      }

      console.log(`✅ Property '${property.property_name}' disconnected from PMS`);
      return true;
    } catch (error: any) {
      console.error('Error disconnecting property from PMS:', error.message);
      throw error;
    }
  }

  /**
   * Get property's current PMS connection
   * @param propertyId - Property ID
   */
  static async getPropertyPMSConnection(propertyId: string): Promise<any> {
    try {
      const property = await PropertyInfo.findById(propertyId).populate('dataSource');

      if (!property) {
        throw new Error(`Property not found: ${propertyId}`);
      }

      if (!property.dataSource) {
        return {
          property: property.property_name,
          pms: null,
          message: 'No PMS connected',
        };
      }

      const dataSource = property.dataSource as any;
      return {
        property: property.property_name,
        pms: {
          name: dataSource.name,
          type: dataSource.type,
          format: dataSource.format,
          isActive: dataSource.isActive,
          apiEndpoint: dataSource.apiEndpoint,
        },
      };
    } catch (error: any) {
      console.error('Error getting property PMS connection:', error.message);
      throw error;
    }
  }

  /**
   * Get all available PMS options
   */
  static async getAvailablePMS(): Promise<any[]> {
    try {
      const dataSources = await DataSourceProvider.find({ isActive: true });
      return dataSources.map((ds) => ({
        id: ds._id,
        name: ds.name,
        type: ds.type,
        format: ds.format,
        description: ds.description,
      }));
    } catch (error: any) {
      console.error('Error getting available PMS:', error.message);
      throw error;
    }
  }

  /**
   * Get properties by PMS type
   * @param pmsName - Name of PMS
   */
  static async getPropertiesByPMS(pmsName: string): Promise<any[]> {
    try {
      const dataSource = await DataSourceProvider.findOne({ name: pmsName });

      if (!dataSource) {
        throw new Error(`PMS '${pmsName}' not found`);
      }

      const properties = await PropertyInfo.find({ dataSource: dataSource._id })
        .select('property_name property_code property_email')
        .lean();

      return properties;
    } catch (error: any) {
      console.error('Error getting properties by PMS:', error.message);
      throw error;
    }
  }

  /**
   * Switch property from one PMS to another
   * @param propertyId - Property ID
   * @param newPMSName - New PMS name
   */
  static async switchPropertyPMS(propertyId: string, newPMSName: string): Promise<boolean> {
    try {
      const currentConnection = await this.getPropertyPMSConnection(propertyId);
      
      if (currentConnection.pms && currentConnection.pms.name === newPMSName) {
        console.log(`Property is already connected to ${newPMSName}`);
        return true;
      }

      console.log(
        `Switching property from ${currentConnection.pms?.name || 'None'} to ${newPMSName}`
      );

      return await this.connectPropertyToPMS(propertyId, newPMSName);
    } catch (error: any) {
      console.error('Error switching property PMS:', error.message);
      throw error;
    }
  }

  /**
   * Validate PMS configuration for property
   * @param propertyId - Property ID
   */
  static async validatePMSConfiguration(propertyId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const property = await PropertyInfo.findById(propertyId).populate('dataSource');

      if (!property) {
        errors.push('Property not found');
        return { valid: false, errors, warnings };
      }

      if (!property.dataSource) {
        warnings.push('No PMS configured - using backward compatibility mode');
        return { valid: true, errors, warnings };
      }

      const dataSource = property.dataSource as any;

      if (!dataSource.isActive) {
        errors.push(`PMS '${dataSource.name}' is not active`);
      }

      if (dataSource.type === 'PMS' && !dataSource.apiEndpoint) {
        errors.push('API endpoint not configured for external PMS');
      }

      if (dataSource.name === 'QuotusPMS' && !process.env.QUOTUS_PMS_TOKEN) {
        warnings.push('QuotusPMS token not configured in environment variables');
      }

      if (dataSource.name === 'Wincloud' && !process.env.WINCLOUD_TEST_API) {
        warnings.push('Wincloud API URL not configured in environment variables');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
      return { valid: false, errors, warnings };
    }
  }
}
