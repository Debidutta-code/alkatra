/**
 * Seed script to populate DataSourceProvider collection
 * Run this script to ensure all PMS integrations are registered in the database
 * 
 * Usage: ts-node src/scripts/seedDataSourceProviders.ts
 */

import mongoose from 'mongoose';
import { DataSourceProvider } from '../property_management/src/model/dataSourceProvider.model';
import { config } from '../config/env.variable';

const dataSources = [
  {
    name: 'Internal',
    type: 'Internal' as const,
    format: undefined,
    isActive: true,
    apiEndpoint: undefined,
    description: 'Al-Hajz Internal Extranet System - No external PMS integration required',
  },
  {
    name: 'Wincloud',
    type: 'PMS' as const,
    format: 'XML' as const,
    isActive: true,
    apiEndpoint: process.env.WINCLOUD_TEST_API || 'https://api.wincloud.com/reservations',
    description: 'Wincloud PMS Integration - XML-based API',
  },
  {
    name: 'QuotusPMS',
    type: 'PMS' as const,
    format: 'JSON' as const,
    isActive: true,
    apiEndpoint: process.env.QUOTUS_PMS_API || 'http://localhost:9000/api/reservations',
    description: 'QuotusPMS Integration - JSON-based RESTful API',
  },
  {
    name: 'ChannelManager',
    type: 'CM' as const,
    format: 'JSON' as const,
    isActive: false,
    apiEndpoint: undefined,
    description: 'Channel Manager Integration (Future) - Multi-PMS management',
  },
];

async function seedDataSources() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.database.mongoURI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Seeding DataSourceProvider collection...');

    for (const source of dataSources) {
      // Check if data source already exists
      const existing = await DataSourceProvider.findOne({ name: source.name });

      if (existing) {
        console.log(`ℹ️  ${source.name} already exists (${existing._id})`);
        
        // Update if needed
        const updated = await DataSourceProvider.findByIdAndUpdate(
          existing._id,
          {
            $set: {
              type: source.type,
              format: source.format,
              isActive: source.isActive,
              description: source.description,
              ...(source.apiEndpoint && { apiEndpoint: source.apiEndpoint }),
            },
          },
          { new: true }
        );
        console.log(`   ✓ Updated: ${updated?.name} (Active: ${updated?.isActive})`);
      } else {
        // Create new data source
        const newSource = await DataSourceProvider.create(source);
        console.log(`✅ Created: ${newSource.name} (${newSource._id})`);
        console.log(`   Type: ${newSource.type} | Format: ${newSource.format || 'N/A'}`);
      }
    }

    console.log('✅ Data source seeding completed successfully!');
    
    // Display summary
    const allSources = await DataSourceProvider.find();
    console.log('📋 Current Data Sources:');
    allSources.forEach((source) => {
      console.log(`   - ${source.name} (${source.type}) - ${source.isActive ? '✓ Active' : '✗ Inactive'}`);
    });

  } catch (error: any) {
    console.error('❌ Error seeding data sources:', error.message);
    throw error;
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDataSources()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { seedDataSources };
