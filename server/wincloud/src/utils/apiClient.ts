import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { stringify } from 'flatted';

export class ApiClient {
    async sendToThirdParty(xml: string): Promise<{ message: string }> {
        try {
            console.log('Sending XML to third-party API:', xml);
            const apiUrl = process.env.WINCLOUD_TEST_API;
            if (!apiUrl) {
                throw new Error('WINCLOUD_TEST_API environment variable is not defined');
            }
            console.log('Third-party API URL:', apiUrl);
            const apiResponse = await axios.post(apiUrl, xml, {
                headers: { 'Content-Type': 'text/xml' },
            });

            console.log("API Response:", stringify(apiResponse));
            console.log("→ Status:", apiResponse.status);
            console.log("→ Status Text:", apiResponse.statusText);
            console.log("→ Headers:", apiResponse.headers);
            console.log("→ Data:", apiResponse.data);

            if (apiResponse.status !== 200) {
                throw new Error(`Third-party API responded with status code ${apiResponse.status}`);
            }

            // Return early with just 200 response message
            return { message: 'Successfully sent to third-party API' };

        } catch (error: any) {
            console.error('API Client Error:', error);
            throw new Error(`Failed to send to third-party API: ${error.message}`);
        }
    }
}
