// utils/geocoding.ts

interface NominatimResponse {
    display_name: string;
    address: {
      city?: string;
      state?: string;
      country?: string;
      country_code?: string;
      postcode?: string;
      road?: string;
    };
  }
  
  interface GeocodingResult {
    formattedAddress: string;
    city: string;
    state: string;
    country: string;
    countryCode: string;
    postalCode: string;
    street: string;
  }
  
  export const reverseGeocode = async (latitude: number, longitude: number): Promise<GeocodingResult> => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'YourApp/1.0', // Required by Nominatim's terms of use
        },
      });
  
      // Check if response is OK
      if (!response.ok) {
        console.error('Geocoding failed with status:', response.status);
        return createEmptyGeocodingResult();
      }
  
      const data: NominatimResponse = await response.json();
      
      // Check if the response has the expected data
      if (!data || !data.address) {
        console.error('Invalid geocoding response:', data);
        return createEmptyGeocodingResult();
      }
  
      return {
        formattedAddress: data.display_name,
        city: data.address.city || '',
        state: data.address.state || '',
        country: data.address.country || '',
        countryCode: data.address.country_code?.toUpperCase() || '',
        postalCode: data.address.postcode || '',
        street: data.address.road || '',
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      return createEmptyGeocodingResult();
    }
  };
  
  // Helper function to create an empty geocoding result
  const createEmptyGeocodingResult = (): GeocodingResult => ({
    formattedAddress: '',
    city: '',
    state: '',
    country: '',
    countryCode: '',
    postalCode: '',
    street: '',
  });
  