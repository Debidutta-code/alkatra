// File: utils/dynamicIataLookup.ts

interface Airport {
    city: string;
    country: string;
    iata: string;
  }
  
  // This is a small subset of airports. In a real application, you'd have a much larger dataset.
  const airports: Airport[] = [
    { city: "Bhubaneswar", country: "India", iata: "BBI" },
    { city: "Delhi", country: "India", iata: "DEL" },
    { city: "Mumbai", country: "India", iata: "BOM" },
    { city: "Bangalore", country: "India", iata: "BLR" },
    { city: "Chennai", country: "India", iata: "MAA" },
    { city: "Kolkata", country: "India", iata: "CCU" },
    { city: "Hyderabad", country: "India", iata: "HYD" },
    { city: "Ahmedabad", country: "India", iata: "AMD" },
    { city: "Pune", country: "India", iata: "PNQ" },
    { city: "Goa", country: "India", iata: "GOI" },
    // Add more airports as needed
  ];
  
  function levenshteinDistance(a: string, b: string): number {
    const matrix = [];
  
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
  
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
  
    return matrix[b.length][a.length];
  }
  
  export function getIATACode(cityName: string): string {
    const normalizedCityName = cityName.toLowerCase().trim();
    
    let closestMatch = airports[0];
    let smallestDistance = Infinity;
  
    for (const airport of airports) {
      const distance = levenshteinDistance(normalizedCityName, airport.city.toLowerCase());
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestMatch = airport;
      }
    }
  
    // If the closest match is too far off, return the original city name
    if (smallestDistance > 3) {
      return cityName;
    }
  
    return closestMatch.iata;
  }
  
  export function addAirport(city: string, country: string, iata: string): void {
    airports.push({ city, country, iata });
  }