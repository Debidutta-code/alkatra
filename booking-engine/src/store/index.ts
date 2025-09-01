// import { create } from "zustand";

// export interface FlightOffersResponseRoot {
//   dictionaries: any;
//   success: boolean;
//   data: FlightOffersResponseRootData;
// }

// export interface FlightOffersResponseRootData {
//   [x: string]: any;
//   meta: Meta;
//   data: Data[];
//   dictionaries: Dictionaries;
// }

// export interface Meta {
//   count: number;
//   links: Links;
// }

// export interface Links {
//   self: string;
// }

// export interface Data {
//   type: string;
//   id: string;
//   source: string;
//   instantTicketingRequired: boolean;
//   nonHomogeneous: boolean;
//   oneWay: boolean;
//   isUpsellOffer: boolean;
//   lastTicketingDate: string;
//   lastTicketingDateTime: string;
//   numberOfBookableSeats: number;
//   itineraries: Itinerary[];
//   price: Price;
//   pricingOptions: PricingOptions;
//   validatingAirlineCodes: string[];
//   travelerPricings: TravelerPricing[];
// }

// export interface Itinerary {
//   duration: string;
//   segments: Segment[];
// }

// export interface Segment {
//   departure: Departure;
//   arrival: Arrival;
//   carrierCode: string;
//   number: string;
//   aircraft: Aircraft;
//   operating: Operating;
//   duration: string;
//   id: string;
//   numberOfStops: number;
//   blacklistedInEU: boolean;
// }

// export interface Departure {
//   iataCode: string;
//   terminal: string;
//   at: string;
// }

// export interface Arrival {
//   iataCode: string;
//   terminal: string;
//   at: string;
// }

// export interface Aircraft {
//   code: string;
// }

// export interface Operating {
//   carrierCode: string;
// }

// export interface Price {
//   currency: string;
//   total: string;
//   base: string;
//   fees: Fee[];
//   grandTotal: string;
// }

// export interface Fee {
//   amount: string;
//   type: string;
// }

// export interface PricingOptions {
//   fareType: string[];
//   includedCheckedBagsOnly: boolean;
// }

// export interface TravelerPricing {
//   travelerId: string;
//   fareOption: string;
//   travelerType: string;
//   price: Price2;
//   fareDetailsBySegment: FareDetailsBySegment[];
// }

// export interface Price2 {
//   currency: string;
//   total: string;
//   base: string;
// }

// export interface FareDetailsBySegment {
//   segmentId: string;
//   cabin: string;
//   fareBasis: string;
//   brandedFare: string;
//   brandedFareLabel: string;
//   class: string;
//   includedCheckedBags: IncludedCheckedBags;
//   amenities: Amenity[];
// }

// export interface IncludedCheckedBags {
//   weight: number;
//   weightUnit: string;
// }

// export interface Amenity {
//   description: string;
//   isChargeable: boolean;
//   amenityType: string;
//   amenityProvider: AmenityProvider;
// }

// export interface AmenityProvider {
//   name: string;
// }

// export interface Dictionaries {
//   locations: Locations;
//   aircraft: Aircraft2;
//   currencies: Currencies;
//   carriers: Carriers;
// }

// export interface Locations {
//   BOM: Bom;
//   BBI: Bbi;
//   DEL: Del;
//   COK: Cok;
// }

// export interface Bom {
//   cityCode: string;
//   countryCode: string;
// }

// export interface Bbi {
//   cityCode: string;
//   countryCode: string;
// }

// export interface Del {
//   cityCode: string;
//   countryCode: string;
// }

// export interface Cok {
//   cityCode: string;
//   countryCode: string;
// }

// export interface Aircraft2 {
//   "320": string;
// }

// export interface Currencies {
//   INR: string;
// }

// export interface Carriers {
//   UK: string;
// }

// export type FormState = {
//   firstName: string;
//   lastName: string;
//   gender: string;
//   dob: string;
//   email: string;
//   phone: string;
// };

// export interface Traveler {
//   id: string;
//   dateOfBirth: string;
//   gender: "MALE" | "FEMALE" | "OTHER";
//   contact?: Contact;
//   name: Name;
// }

// export interface Contact {
//   emailAddress: string;
//   phones: Phone[];
// }

// export interface Phone {
//   deviceType: string;
//   countryCallingCode: string;
//   number: string;
// }

// export interface Name {
//   firstName: string;
//   lastName: string;
// }
// export type SearchFormState = {
//   includedAirlines: any;
//   tripType: string;        // e.g. "one-way", "round-trip"
//   travelClass: string;     // e.g. "economy", "business"
//   directFlight: boolean;   // e.g. true for direct flights only
//   origin: {
//     label: string, value: string
//   };
//   destination: {
//     label: string, value: string
//   }; 
//   departureDate: string;     // date of departure
//   returnDate: string;        // date of return (optional for one-way)
//   adult: number;           // number of adult passengers
//   child: number;           // number of child passengers
// };

// export interface FilterState{
//   directFlight: boolean;
//   includedAirlines: string[]
// }

// // FlightOffersState now includes selectedFlight
// export type FlightOffersState = {
//   flightOffers: FlightOffersResponseRoot;
//   searched: boolean;
//   loading: boolean;
//   selectedFlight: Data;
//   travelers: Traveler[];
//   searchForm: SearchFormState;
//   filterState: FilterState;
// };

// export type FlightOffersActions = {
//   setLoading: (loading: boolean) => void;
//   setSearched: (searched: boolean) => void;
//   setFlightOffers: (flightOffers: FlightOffersResponseRoot) => void;
//   setSelectedFlight: (flight: Data) => void; // action to set selected flight
//   setTravelers: (travelers: Traveler[]) => void;
//   setSearchForm: (form: SearchFormState) => void;
//   updateSearchFormField: <K extends keyof SearchFormState>(key: K, value: SearchFormState[K]) => void;
//   updateFilterStateField: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
// };

// export type FlightOffersStore = FlightOffersState & FlightOffersActions;

// export const initFlightOffersStore = (): FlightOffersState => {
//   return {
//     loading: false,
//     searched: false,
//     flightOffers: {} as FlightOffersResponseRoot,
//     selectedFlight: {} as Data, // initial selected flight is null
//     travelers: [] as Traveler[],
//     searchForm: {} as SearchFormState,
//     filterState: {} as FilterState
//   };
// };

// export const defaultInitState: FlightOffersState = {
//   loading: false,
//   searched: false,
//   flightOffers: {} as FlightOffersResponseRoot,
//   selectedFlight: {} as Data,
//   travelers: [] as Traveler[],
//   searchForm: {
//     tripType: "ONEWAY",
//     travelClass: "ECONOMY",
//     directFlight: false,
//     origin: {
//       label: "", value: ""
//     },
//     destination: {
//       label: "", value: ""
//     },
//     departureDate: "",
//     returnDate: "",
//     adult: 1,
//     child: 0,
//   } as SearchFormState,
//   filterState: {
//     directFlight: false,
//     includedAirlines: []
//   } as FilterState
// };

// export const useFlightOffersStore = (
//   initState: FlightOffersState = defaultInitState
// ) => {
//   return create<FlightOffersStore>((set) => ({
//     ...defaultInitState,
//     setLoading(loading) {
//       set({ loading });
//     },
//     setSearched(searched) {
//       set({
//         searched,
//       });
//     },
//     setFlightOffers: (flightOffers: FlightOffersResponseRoot) =>
//       set({ flightOffers }),
//     setSelectedFlight: (selectedFlight: Data) => set({ selectedFlight }),
//     setTravelers(travelers: Traveler[]) {
//       set({ travelers });
//     },
//     setSearchForm: (form: SearchFormState) => set({ searchForm: form  }),
//     updateSearchFormField: (key, value) =>
//       set((state) => {
//         console.log("state" , state)
//         return({
//         ...state,
//         searchForm: {
//           ...state.searchForm,
//           [key]: value,
//         },
//       })}),
//     updateFilterStateField: (key, value) =>
//       set((state) => {
//         console.log("state" , state)
//         return({
//         ...state,
//         filterState: {
//           ...state.filterState,
//           [key]: value,
//         },
//       })}),

//   }));
// };
