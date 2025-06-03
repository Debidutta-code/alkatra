import { startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { RatePlan, RatePlan as RatePlanType } from "../common/interface/ratePlan.interface";
import { RatePlanDao } from "../dao/ratePlan.dao";
import { HotelPricesDao } from "../dao/hotelPrices.dao";

interface UpdatePlanData {
  rateAmountId: string;
  inventoryId: string;
  price: number;
  availability: number;
}
interface BaseGuestAmount {
  amountBeforeTax: number;
  numberOfGuests: number;
}

interface AdditionalGuestAmount {
  ageQualifyingCode: string;
  amount: number;
}

interface RateCalculationResult {
  success: boolean;
  message?: string;
  data?: {
    totalAmount: number;
    numberOfNights: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;
    breakdown: {
      baseAmount: number;
      additionalAdultCharges: number;
      additionalChildCharges: number;
      totalPerNight: number;
      totalForAllNights: number;
    };
    dailyBreakdown?: Array<{
      date: string;
      dayOfWeek: string;
      ratePlanCode: string;
      baseRate: number;
      additionalCharges: number;
      totalPerRoom: number;
      totalForAllRooms: number;
      currencyCode: string;
    }>;
    availableRooms: number;
    requestedRooms: number;
  };
}
interface checkAvailabilityInterface {
  message: string;
  success: boolean,
  isAvailable: boolean;
  error?: string
}
class RatePlanService {
  public static async createRatePlan(ratePlanData: any) {
    // Extract scheduling fields
    const {
      type,
      weeklyDays,
      dateRanges,
      availableSpecificDates,
      ...rest
    } = ratePlanData;

    const finalRatePlanData: RatePlanType = {
      ...rest,
      scheduling: {
        type,
        weeklyDays,
        dateRanges,
        availableSpecificDates
      }
    };

    // console.log("finalRatePlanData", finalRatePlanData);

    const savedRatePlan = await RatePlanDao.create(finalRatePlanData);

    return {
      success: true,
      message: "Rate plan created successfully",
      data: savedRatePlan
    };
  }

  public static async updateRatePlan(ratePlanData: UpdatePlanData[]) {
    // Optional: Add validation or preprocessing here if needed

    const updatedRatePlan = await RatePlanDao.updateRatePlan(ratePlanData);
    return {
      success: true,
      message: "Rate plan updated successfully",
      data: updatedRatePlan,
    };
  }
  public static async getRatePlanByHotel(hotelCode: string, invTypeCode?: string, startDate?: Date, endDate?: Date, page?: number) {
    const ratePlans = await RatePlanDao.getRatePlanByHotel(hotelCode, invTypeCode && invTypeCode, startDate && startDate, endDate && endDate, page && page);
    // console.log(ratePlans)
    return {
      success: true,
      message: "Rate plans retrieved successfully",
      data: ratePlans,
    };
  }
  public static async getRatePlanByHotelCode(hotelCode: string) {
    const ratePlans = await RatePlanDao.getRatePlanByHotelCode(hotelCode);

    if (ratePlans.length === 0) throw new Error("No rate plans found for this hotel code");

    return {
      success: true,
      message: "Rate plans retrieved successfully",
      data: ratePlans,
    };
  }

}
class RoomPriceService {
  public static async getRoomPriceService(hotelCode: string, invTypeCode: string) {
    try {
      const dbResults = await HotelPricesDao.getHotelPlans(hotelCode, invTypeCode);
      if (!dbResults[0]?.baseByGuestAmts[dbResults[0].baseByGuestAmts.length - 1]?.amountBeforeTax) {
        new Error("Price not found")
      }
      return {
        success: true,
        pricePerNight: dbResults[0]?.baseByGuestAmts[dbResults[0].baseByGuestAmts.length - 1]?.amountBeforeTax
      }
    } catch (error) {
      return {
        success: false,
        message: error?.message
      }
    }
  }
  public static async getAllRoomTypeService() {
    try {
      const responses = await RatePlanDao.getAllRoomType()
      return {
        success: true,
        roomTypes: responses
      }
    } catch (error: any) {
      console.log(error.message)
      return {
        success: false,
        message: error.message
      }
    }
  }
  public static async checkAvailabilityService(hotelcode: string,
    invTypeCode: string,
    startDate: Date,
    endDate: Date,
    noOfRooms: number
  ) {
    try {
      const availability = await HotelPricesDao.checkAvailabilityDao(hotelcode, invTypeCode, startDate, endDate)
      console.log("availability", availability)
      if (availability.availability.count < noOfRooms) {
        return {
          success: true,
          isAvailable: false,
          message: `from ${startDate} to ${endDate} only ${availability.availability.count} room's are available`
        }
      }else{
        return {
          success:true,
          isAvailable:true,
          totalAvailableRooms:availability.availability.count,
          demandedRooms:noOfRooms
        }
      }
      if (!availability) {
        return {
          success: false,
          message: ""
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Error occur while checking availability ",
        error: error.message,

      }
    }
  }
}
class RoomRentCalculationService {

  public static async getRoomRentService(
    hotelcode: string,
    invTypeCode: string,
    startDate: Date,
    endDate: Date,
    noOfChildrens: number,
    noOfAdults: number,
    noOfRooms: number
  ): Promise<RateCalculationResult> {

    try {
      // Input validation
      const validationResult = this.validateInputs(
        hotelcode, invTypeCode, startDate, endDate,
        noOfChildrens, noOfAdults, noOfRooms
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message
        };
      }

      const start = startOfDay(startDate);
      const end = startOfDay(endDate); // Use startOfDay for endDate to exclude checkout day
      const numberOfNights = differenceInDays(end, start);

      if (numberOfNights <= 0) {
        return {
          success: false,
          message: "End date must be after start date"
        };
      }

      // Get inventory with rates - use endOfDay for data fetching but not for night calculation
      const inventory = await HotelPricesDao.getInventoryWithRates(hotelcode, invTypeCode, start, endOfDay(endDate));

      if (!inventory || inventory.length === 0) {
        return {
          success: false,
          message: "No rooms are available for the selected dates"
        };
      }

      // Check room availability
      const availableRooms: number[] = [];
      inventory.forEach((i) => {
        if (i.inventory?.availability?.count) {
          availableRooms.push(i.inventory.availability.count);
        }
      });

      if (availableRooms.length === 0) {
        return {
          success: false,
          message: "No room availability data found"
        };
      }

      const minimumRoomAvailable = Math.min(...availableRooms);

      if (minimumRoomAvailable < noOfRooms) {
        return {
          success: false,
          message: `Only ${minimumRoomAvailable} rooms available, but ${noOfRooms} rooms requested from ${start.toDateString()} to ${endDate.toDateString()}`
        };
      }

      // Calculate total rent day-by-day
      const rateCalculation = this.calculateRoomRates(
        inventory,
        noOfAdults,
        noOfChildrens,
        noOfRooms,
        numberOfNights,
        start,
        end // Pass the corrected end date (startOfDay)
      );

      if (!rateCalculation.success) {
        return rateCalculation;
      }

      return {
        success: true,
        data: {
          ...rateCalculation.data!,
          availableRooms: minimumRoomAvailable,
          requestedRooms: noOfRooms,
          numberOfNights
        }
      };

    } catch (error) {
      console.error('Error in getRoomRentService:', error);
      return {
        success: false,
        message: "An error occurred while calculating room rates"
      };
    }
  }

  private static validateInputs(
    hotelcode: string,
    invTypeCode: string,
    startDate: Date,
    endDate: Date,
    noOfChildrens: number,
    noOfAdults: number,
    noOfRooms: number
  ): { isValid: boolean; message?: string } {

    if (!hotelcode || !invTypeCode) {
      return { isValid: false, message: "Hotel code and inventory type code are required" };
    }

    if (!startDate || !endDate) {
      return { isValid: false, message: "Start date and end date are required" };
    }

    if (noOfAdults < 1) {
      return { isValid: false, message: "At least 1 adult is required" };
    }

    if (noOfChildrens < 0) {
      return { isValid: false, message: "Number of children cannot be negative" };
    }

    if (noOfRooms < 1) {
      return { isValid: false, message: "At least 1 room is required" };
    }

    if (startDate >= endDate) {
      return { isValid: false, message: "End date must be after start date" };
    }

    return { isValid: true };
  }

  private static calculateRoomRates(
    inventory: any[],
    noOfAdults: number,
    noOfChildrens: number,
    noOfRooms: number,
    numberOfNights: number,
    startDate: Date,
    endDate: Date // This is now startOfDay(checkout) - excludes checkout day
  ): RateCalculationResult {

    try {
      // Calculate day-by-day rates
      const dayByDayCalculation = this.calculateDayByDayRates(
        inventory,
        noOfAdults,
        noOfChildrens,
        noOfRooms,
        numberOfNights,
        startDate,
        endDate
      );

      if (!dayByDayCalculation.success) {
        return dayByDayCalculation;
      }

      return {
        success: true,
        data: {
          totalAmount: dayByDayCalculation.data!.totalAmount,
          numberOfNights,
          baseRatePerNight: dayByDayCalculation.data!.averageBaseRate,
          additionalGuestCharges: dayByDayCalculation.data!.totalAdditionalCharges,
          breakdown: dayByDayCalculation.data!.breakdown,
          dailyBreakdown: dayByDayCalculation.data!.dailyBreakdown,
          availableRooms: 0,
          requestedRooms: 0
        }
      };

    } catch (error) {
      console.error('Error in calculateRoomRates:', error);
      return {
        success: false,
        message: "Error calculating room rates"
      };
    }
  }

  private static calculateDayByDayRates(
    inventory: any[],
    noOfAdults: number,
    noOfChildrens: number,
    noOfRooms: number,
    numberOfNights: number,
    startDate: Date,
    endDate: Date // This excludes checkout day
  ): any {

    try {
      const dailyBreakdown: any[] = [];
      let totalAmount = 0;
      let totalBaseAmount = 0;
      let totalAdditionalCharges = 0;

      // Generate only the nights to be charged (exclude checkout day)
      const currentDate = new Date(startDate);
      const stayDates: Date[] = [];
      
      // Simple loop: generate dates from checkin until (but not including) checkout
      while (currentDate < endDate) {
        stayDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(`=== Date Generation Debug ===`);
      console.log(`Start Date: ${startDate.toDateString()}`);
      console.log(`End Date: ${endDate.toDateString()}`);
      console.log(`Generated ${stayDates.length} nights: ${stayDates.map(d => d.toDateString()).join(', ')}`);
      console.log(`Expected nights: ${numberOfNights}`);
      console.log(`=== End Debug ===`);

      for (const date of stayDates) {
        const dayOfWeek = this.getDayOfWeek(date);
        let bestRateForDay: any = null;
        let lowestAmountForDay = Infinity;

        // Find all applicable rates for this specific date
        for (const item of inventory) {
          if (!item.rates || item.rates.length === 0) {
            continue;
          }

          for (const rate of item.rates) {
            // Check if rate is applicable for this specific date
            if (!this.isRateApplicableForDate(rate, date, dayOfWeek)) {
              continue;
            }

            const rateCalculation = this.calculateSingleRateAmountForOneDay(
              rate,
              noOfAdults,
              noOfChildrens,
              noOfRooms
            );

            if (rateCalculation.success && rateCalculation.totalAmountForDay < lowestAmountForDay) {
              lowestAmountForDay = rateCalculation.totalAmountForDay;
              bestRateForDay = {
                ...rateCalculation,
                ratePlanCode: rate.ratePlanCode,
                currencyCode: rate.currencyCode,
                date: date
              };
            }
          }
        }

        if (!bestRateForDay) {
          return {
            success: false,
            message: `No suitable rates found for the date: ${date.toDateString()}`
          };
        }

        // Add to daily breakdown
        dailyBreakdown.push({
          date: date.toDateString(),
          dayOfWeek,
          ratePlanCode: bestRateForDay.ratePlanCode,
          baseRate: bestRateForDay.baseRatePerRoom,
          additionalCharges: bestRateForDay.additionalGuestCharges,
          totalPerRoom: bestRateForDay.totalPerRoom,
          totalForAllRooms: bestRateForDay.totalAmountForDay,
          currencyCode: bestRateForDay.currencyCode,
          childrenChargesBreakdown: bestRateForDay.childrenChargesBreakdown
        });

        // Add to totals
        totalAmount += bestRateForDay.totalAmountForDay;
        totalBaseAmount += bestRateForDay.baseRatePerRoom * noOfRooms;
        totalAdditionalCharges += bestRateForDay.additionalGuestCharges * noOfRooms;
      }

      // Verify that we have the correct number of nights
      if (stayDates.length !== numberOfNights) {
        console.warn(`Mismatch: Generated ${stayDates.length} nights but expected ${numberOfNights}`);
      }

      const averageBaseRate = numberOfNights > 0 ? totalBaseAmount / numberOfNights / noOfRooms : 0;

      return {
        success: true,
        data: {
          totalAmount,
          averageBaseRate,
          totalAdditionalCharges: numberOfNights > 0 ? totalAdditionalCharges / numberOfNights : 0,
          breakdown: {
            totalBaseAmount,
            totalAdditionalCharges,
            totalAmount,
            numberOfNights,
            averagePerNight: numberOfNights > 0 ? totalAmount / numberOfNights : 0
          },
          dailyBreakdown
        }
      };

    } catch (error) {
      console.error('Error in calculateDayByDayRates:', error);
      return {
        success: false,
        message: "Error calculating day-by-day rates"
      };
    }
  }

  private static getDayOfWeek(date: Date): string {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[date.getDay()];
  }

  private static isRateApplicableForDate(rate: any, date: Date, dayOfWeek: string): boolean {
    // Check if the date falls within the rate's date range
    if (date < new Date(rate.startDate) || date > new Date(rate.endDate)) {
      return false;
    }

    // Check if the rate applies to this day of the week
    if (rate.days && rate.days[dayOfWeek] === false) {
      return false;
    }

    return true;
  }

  private static calculateSingleRateAmountForOneDay(
    rate: any,
    noOfAdults: number,
    noOfChildrens: number,
    noOfRooms: number
  ): any {

    try {
      const totalGuests = noOfAdults + noOfChildrens;

      console.log('=== Rate Calculation Debug ===');
      console.log('Rate Plan Code:', rate.ratePlanCode);
      console.log('Adults:', noOfAdults, 'Children:', noOfChildrens);
      console.log('Available Additional Guest Amounts:', rate.additionalGuestAmounts);

      // Find the appropriate base rate
      const baseByGuestAmts: BaseGuestAmount[] = rate.baseByGuestAmts || [];

      if (baseByGuestAmts.length === 0) {
        return {
          success: false,
          message: "No base guest amounts found for this rate"
        };
      }

      // Sort base rates by number of guests (ascending)
      const sortedBaseRates = baseByGuestAmts.sort((a, b) => a.numberOfGuests - b.numberOfGuests);

      // Find the most appropriate base rate
      let selectedBaseRate: BaseGuestAmount | null = null;

      // Try to find exact match first
      selectedBaseRate = sortedBaseRates.find(rate => rate.numberOfGuests === totalGuests) || null;

      // If no exact match, find the highest base rate that's less than or equal to total guests
      if (!selectedBaseRate) {
        for (let i = sortedBaseRates.length - 1; i >= 0; i--) {
          if (sortedBaseRates[i].numberOfGuests <= totalGuests) {
            selectedBaseRate = sortedBaseRates[i];
            break;
          }
        }
      }

      // If still no match, use the lowest base rate
      if (!selectedBaseRate) {
        selectedBaseRate = sortedBaseRates[0];
      }

      const baseRatePerRoom = selectedBaseRate.amountBeforeTax;
      const baseGuestsIncluded = selectedBaseRate.numberOfGuests;

      console.log('Selected Base Rate:', selectedBaseRate);
      console.log('Base Guests Included:', baseGuestsIncluded);

      // Calculate additional charges for guests exceeding base coverage
      let additionalAdultCharges = 0;
      let additionalChildrenCharges = 0;
      let childrenChargesBreakdown: any[] = [];

      const additionalGuestAmounts: AdditionalGuestAmount[] = rate.additionalGuestAmounts || [];

      // Only calculate additional charges if total guests exceed base coverage
      if (totalGuests > baseGuestsIncluded) {
        console.log('Total guests exceed base coverage, calculating additional charges...');
        
        const extraGuests = totalGuests - baseGuestsIncluded;
        console.log('Extra guests beyond base:', extraGuests);

        // Calculate additional adults (if any)
        const additionalAdults = Math.max(0, noOfAdults - Math.max(0, baseGuestsIncluded - noOfChildrens));
        
        if (additionalAdults > 0) {
          // Find adult rate (ageQualifyingCode '10')
          const adultRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '10');
          if (adultRate) {
            additionalAdultCharges = additionalAdults * adultRate.amount;
            console.log(`Additional adults to charge: ${additionalAdults} at ${adultRate.amount} each = ${additionalAdultCharges}`);
          } else {
            console.warn('No adult rate (code 10) found in additionalGuestAmounts');
          }
        }

        // Simple children charges: if children are coming, find code 8 and add price
        if (noOfChildrens > 0) {
          const childRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '8');
          if (childRate) {
            additionalChildrenCharges = noOfChildrens * childRate.amount;
            console.log(`Children to charge: ${noOfChildrens} at ${childRate.amount} each = ${additionalChildrenCharges}`);
            
            // Create simple breakdown for children
            for (let i = 0; i < noOfChildrens; i++) {
              childrenChargesBreakdown.push({
                childIndex: i + 1,
                ageQualifyingCode: '8',
                chargeAmount: childRate.amount
              });
            }
          } else {
            console.warn('No child rate (code 8) found in additionalGuestAmounts - children will be free');
            // If no child rate found, children are free
            for (let i = 0; i < noOfChildrens; i++) {
              childrenChargesBreakdown.push({
                childIndex: i + 1,
                ageQualifyingCode: '8',
                chargeAmount: 0,
                note: 'No applicable rate found - charged as free'
              });
            }
          }
        }
      } else {
        console.log('All guests covered by base rate, no additional charges needed');
        
        // Still create breakdown for children but with zero charges
        for (let i = 0; i < noOfChildrens; i++) {
          childrenChargesBreakdown.push({
            childIndex: i + 1,
            ageQualifyingCode: '8',
            chargeAmount: 0,
            note: 'Covered by base rate'
          });
        }
      }

      const totalAdditionalChargesPerRoom = additionalAdultCharges + additionalChildrenCharges;
      const totalPerRoom = baseRatePerRoom + totalAdditionalChargesPerRoom;
      const totalAmountForDay = totalPerRoom * noOfRooms;

      console.log('Additional Adult Charges:', additionalAdultCharges);
      console.log('Additional Children Charges:', additionalChildrenCharges);
      console.log('Total Additional Charges Per Room:', totalAdditionalChargesPerRoom);
      console.log('=== End Debug ===');

      return {
        success: true,
        baseRatePerRoom,
        additionalGuestCharges: totalAdditionalChargesPerRoom,
        totalPerRoom,
        totalAmountForDay,
        childrenChargesBreakdown,
        breakdown: {
          baseAmount: baseRatePerRoom,
          additionalAdultCharges,
          additionalChildrenCharges,
          totalAdditionalCharges: totalAdditionalChargesPerRoom,
          baseGuestsIncluded,
          childrenChargesDetail: childrenChargesBreakdown
        }
      };

    } catch (error) {
      console.error('Error in calculateSingleRateAmountForOneDay:', error);
      return {
        success: false,
        message: "Error calculating single day rate amount"
      };
    }
  }
}
export { RatePlanService, RoomPriceService, RoomRentCalculationService };
