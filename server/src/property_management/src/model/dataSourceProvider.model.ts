import mongoose, { Document, Schema } from 'mongoose';

export interface DataSourceProviderType extends Document {
  name: string;
  type: 'PMS' | 'CM' | 'Internal';
  isActive: boolean;
  apiEndpoint?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dataSourceProviderSchema = new Schema<DataSourceProviderType>({
  name: { type: String, required: true },
  type: { type: String, enum: ['PMS', 'CM', 'Internal'], required: true },
  isActive: { type: Boolean, default: true },
  apiEndpoint: { type: String },
  description: { type: String }
}, {
  timestamps: true
});

export const DataSourceProvider = mongoose.model<DataSourceProviderType>('DataSourceProvider', dataSourceProviderSchema);