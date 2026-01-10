import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IQuotusPMSReservation } from '../interfaces/reservation.interface';

export class QuotusPMSApiClient {
  private client: AxiosInstance;
  private apiEndpoint: string;

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || process.env.QUOTUS_PMS_API || 'http://localhost:9000/api/reservations';
    
    this.client = axios.create({
      baseURL: this.apiEndpoint,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('QuotusPMS API Client initialized with endpoint:', this.apiEndpoint);
  }

  /**
   * Send reservation to QuotusPMS
   */
  async sendReservation(reservation: IQuotusPMSReservation): Promise<any> {
    try {
      console.log('Sending reservation to QuotusPMS:', this.apiEndpoint);
      console.log('Reservation data:', JSON.stringify(reservation, null, 2));

      const response: AxiosResponse = await this.client.post('', reservation);

      console.log('QuotusPMS Response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        console.error('QuotusPMS API Error Response:', error.response.status, error.response.data);
        throw new Error(
          `QuotusPMS API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      } else if (error.request) {
        // Request made but no response received
        console.error('No response from QuotusPMS:', error.request);
        throw new Error('No response received from QuotusPMS API');
      } else {
        // Error in request setup
        console.error('Error setting up request to QuotusPMS:', error.message);
        throw new Error(`Failed to send reservation to QuotusPMS: ${error.message}`);
      }
    }
  }

  /**
   * Update API endpoint dynamically
   */
  setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint;
    this.client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('QuotusPMS API endpoint updated to:', endpoint);
  }
}
