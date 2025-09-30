import axios from 'axios';


export class ApiClient {
    async sendToThirdParty(xml: string): Promise<{ message: string }> {
        try {
            // console.log('Sending XML to third-party API:', xml);
            const apiUrl = process.env.WINCLOUD_TEST_API;
            if (!apiUrl) {
                throw new Error('WINCLOUD_TEST_API environment variable is not defined');
            }
            
            const apiResponse = await axios.post(apiUrl, xml, {
                headers: { 'Content-Type': 'text/xml' },
            });

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
