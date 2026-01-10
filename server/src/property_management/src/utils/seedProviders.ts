import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DataSourceProvider } from '../model/dataSourceProvider.model';

// Load environment variables
dotenv.config({ path: '../../../../.env' });

const seedProviders = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = `${process.env.EXTRANET_MONGO_URI_TESTING}`;
    await mongoose.connect(mongoUri);

    // Clear existing providers
    await DataSourceProvider.deleteMany({});

        // Seed PMS providers
    const pmsProviders = [
      {
        name: 'Wincloud',
        type: 'PMS',
        format: 'XML',
        isActive: true,
        apiEndpoint: process.env.WINCLOUD_TEST_API,
        description: 'XML-based PMS for property management'
      },
      {
        name: 'QuotusPMS',
        type: 'PMS',
        format: 'JSON',
        isActive: true,
        apiEndpoint: process.env.QUOTUS_PMS_API || 'http://localhost:9000/api/reservations',
        description: 'JSON-based PMS for property management'
      }
    ];

    // Seed CM providers (empty for now)
    const cmProviders: any[] = [];

    // Seed Internal provider
    const internalProviders = [
      {
        name: 'Internal',
        type: 'Internal',
        isActive: true,
        description: 'Properties managed internally within the system'
      }
    ];

    const allProviders = [...pmsProviders, ...cmProviders, ...internalProviders];

    await DataSourceProvider.insertMany(allProviders);

    console.log('Data source providers seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding providers:', error);
    process.exit(1);
  }
};

seedProviders();
