import { BookAgainRepository } from "../repository";


export class BookAgainAvailabilityService {

    private static instance: BookAgainAvailabilityService;
    private bookAgainRepository : BookAgainRepository;

    private constructor() {
        this.bookAgainRepository = BookAgainRepository.getInstance();
    }

    static getInstance(): BookAgainAvailabilityService {
        if (!BookAgainAvailabilityService.instance) {
            BookAgainAvailabilityService.instance = new BookAgainAvailabilityService();
        }
        return BookAgainAvailabilityService.instance;
    }

    async bookAgainAvailability(hotelCode: string, invTypeCode: string, startDate: string, endDate: string) {
        
        if (!hotelCode || !invTypeCode || !startDate || !endDate) {
            throw new Error ("Some details are not found");
        };

        const checkAvailability = await BookAgainRepository.getRatePlanByHotel(hotelCode, invTypeCode, startDate, endDate);
        console.log("checkAvailability", checkAvailability);
        if (checkAvailability.data.length === 0) {
            throw new Error (`No rooms are available for the selected dates`);
        }

        return checkAvailability;
    }
}