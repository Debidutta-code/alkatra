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
        if (!checkAvailability) {
            throw new Error ("Getting error at while checking availability");
        }

        return checkAvailability;
    }
}