import mongoose, { Document, Schema } from 'mongoose';

export interface DataSourceProviderType extends Document {
  name: string;
  type: 'PMS' | 'CM' | 'Internal';
  format?: 'XML' | 'JSON'; // Data format used by the PMS
  isActive: boolean;
  apiEndpoint?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dataSourceProviderSchema = new Schema<DataSourceProviderType>({
  name: { type: String, required: true },
  type: { type: String, enum: ['PMS', 'CM', 'Internal'], required: true },
  format: { type: String, enum: ['XML', 'JSON'], required: false },
  isActive: { type: Boolean, default: true },
  apiEndpoint: { type: String },
  description: { type: String }
}, {
  timestamps: true
});

export const DataSourceProvider = mongoose.model<DataSourceProviderType>('DataSourceProvider', dataSourceProviderSchema);