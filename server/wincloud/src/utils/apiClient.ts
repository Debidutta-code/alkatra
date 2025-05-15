import axios from 'axios'; import { parseStringPromise } from 'xml2js';


export class ApiClient {
    async sendToThirdParty(xml: string): Promise<{ parsedResponse: any; reservationIdMap: { [key: string]: string } }> {
        try {
            const apiUrl = process.env.WINCLOUD_TEST_API;
            if (!apiUrl) {
                throw new Error('WINCLOUD_TEST_API environment variable is not defined');
            }
            const apiResponse = await axios.post(apiUrl, xml, {
                headers: { 'Content-Type': 'application/xml' },
            });
            console.log('API Response:', apiResponse.data);
            
            const parsedResponse = await parseStringPromise(apiResponse.data, { explicitArray: false, mergeAttrs: true });

            const reservationIds = parsedResponse.OTA_HotelResNotifRS.HotelReservations?.HotelReservation?.ResGlobalInfo?.HotelReservationIDs?.HotelReservationID;
            const reservationIdMap: { [key: string]: string } = {};
            if (Array.isArray(reservationIds)) {
                reservationIds.forEach((id: { ResID_Type: string; ResID_Value: string }) => {
                    reservationIdMap[id.ResID_Type] = id.ResID_Value;
                });
            } 
            else if (reservationIds?.ResID_Type) {
                reservationIdMap[reservationIds.ResID_Type] = reservationIds.ResID_Value;
            }
            return { parsedResponse, reservationIdMap };
        } catch (error: any) {
            console.error('API Client Error:', error);
            throw new Error("Failed to send to third - party API: ${ error.message }");
        }
    }
}