import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IQuotusPMSReservation } from '../interfaces/reservation.interface';
import { IQuotusPMSAmendRequest, IQuotusPMSAmendResponse } from '../interfaces/amend.interface';

export class QuotusPMSApiClient {
  private client: AxiosInstance;
  private apiEndpoint: string;
  private accessToken: string;

  constructor(apiEndpoint?: string, accessToken?: string) {
    this.apiEndpoint = apiEndpoint || process.env.PMS_URL 
    this.accessToken = accessToken || process.env.QUOTUS_PMS_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaGF6akBnbWFpbC5jb20iLCJwYXJ0bmVyQ29kZSI6IlBBUlRORVItMTc2ODIwMTE1NjAzNCIsImlhdCI6MTc2ODIwMTE1Nn0.sz5YQKih-L9Vnl6NbOMCGo_fR6pT9t6ao557Qet4dX0';

    this.client = axios.create({
      baseURL: this.apiEndpoint,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'x-partner-access-token': this.accessToken,
      },
    });

    console.log('QuotusPMS API Client initialized with endpoint:', this.apiEndpoint);
    console.log('Authentication token configured:', this.accessToken ? 'Yes' : 'No');
  }

  /**
 * Send reservation to QuotusPMS
 */
  async sendReservation(reservation: IQuotusPMSReservation, propertyCode: string): Promise<any> {
    try {
      console.log('Sending reservation to QuotusPMS:', this.apiEndpoint);
      console.log('Reservation data:', JSON.stringify(reservation, null, 2));

      const response: AxiosResponse = await axios.post(
        `${this.apiEndpoint}${propertyCode}`,
        reservation,
        {
          headers: {
            "Content-Type": "application/json",
            "x-partner-access-token": this.accessToken,
          },
        }
      );

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
   * Fetch initial ARI data from QuotusPMS Partner API
   */
  async fetchInitialData(propertyCode: string, startDate: string, endDate: string): Promise<any> {
    try {
      console.log('========================================');
      console.log('📥 Fetching Initial Data from QuotusPMS');
      console.log('========================================');
      console.log('Property Code:', propertyCode);
      console.log('Date Range:', startDate, 'to', endDate);

      // Call the partner API endpoint
      const response: AxiosResponse = await this.client.get('/property-partner/initial-data', {
        params: {
          propertyCode,
          startDate,
          endDate
        }
      });

      console.log('✅ Initial Data Retrieved Successfully');
      console.log('Response Status:', response.status);
      console.log('Data Summary:');
      console.log('- Rates:', response.data?.data?.rates?.length || 0);
      console.log('- Rate Plans:', response.data?.data?.rateplan?.length || 0);
      console.log('- Charges:', response.data?.data?.charges?.length || 0);
      console.log('========================================');

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('QuotusPMS API Error Response:', error.response.status, error.response.data);
        throw new Error(
          `QuotusPMS API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
        );
      } else if (error.request) {
        console.error('No response from QuotusPMS:', error.request);
        throw new Error('No response received from QuotusPMS API');
      } else {
        console.error('Error fetching initial data:', error.message);
        throw new Error(`Failed to fetch initial data: ${error.message}`);
      }
    }
  }

   /**
   * Amend/Update reservation in QuotusPMS
   */
  async amendReservation(amendRequest: IQuotusPMSAmendRequest): Promise<IQuotusPMSAmendResponse> {
    try {
      console.log('Sending amendment request to QuotusPMS');
      console.log('Amendment data:', JSON.stringify(amendRequest, null, 2));

      const response: AxiosResponse = await axios.put(
        `${this.apiEndpoint}amend`,
        amendRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-partner-access-token': this.accessToken,
          },
        }
      );

      console.log('QuotusPMS Amendment Response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('QuotusPMS Amendment API Error Response:', error.response.status, error.response.data);
        throw new Error(
          `QuotusPMS Amendment API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      } else if (error.request) {
        console.error('No response from QuotusPMS for amendment:', error.request);
        throw new Error('No response received from QuotusPMS Amendment API');
      } else {
        console.error('Error setting up amendment request to QuotusPMS:', error.message);
        throw new Error(`Failed to send amendment to QuotusPMS: ${error.message}`);
      }
    }
  }

  /**
 * Update API endpoint dynamically
 */
  setApiEndpoint(endpoint: string, accessToken?: string): void {
    this.apiEndpoint = endpoint;
    if (accessToken) {
      this.accessToken = accessToken;
    }

    this.client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-partner-access-token': this.accessToken,
      },
    });
    console.log('QuotusPMS API endpoint updated to:', endpoint);
  }
}
