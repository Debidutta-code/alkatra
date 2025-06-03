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
    noOfRooms: number,
    children_ages: number[]
  ): Promise<RateCalculationResult> {

    try {
      // Input validation including children ages
      const validationResult = this.validateInputs(
        hotelcode, invTypeCode, startDate, endDate,
        noOfChildrens, noOfAdults, noOfRooms, children_ages
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message
        };
      }

      const start = startOfDay(startDate);
      const end = endOfDay(endDate);
      const numberOfNights = differenceInDays(end, start);

      if (numberOfNights <= 0) {
        return {
          success: false,
          message: "End date must be after start date"
        };
      }

      // Get inventory with rates
      const inventory = await HotelPricesDao.getInventoryWithRates(hotelcode, invTypeCode, start, end);

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
          message: `Only ${minimumRoomAvailable} rooms available, but ${noOfRooms} rooms requested from ${start.toDateString()} to ${end.toDateString()}`
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
        end,
        children_ages
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
    noOfRooms: number,
    children_ages: number[]
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

    // Validate children ages
    if (noOfChildrens > 0) {
      if (!children_ages || children_ages.length !== noOfChildrens) {
        return { 
          isValid: false, 
          message: `Number of children ages (${children_ages?.length || 0}) must match number of children (${noOfChildrens})` 
        };
      }

      // Check if all ages are valid (positive numbers)
      for (let i = 0; i < children_ages.length; i++) {
        if (children_ages[i] < 0 || children_ages[i] > 17) {
          return { 
            isValid: false, 
            message: `Child age at index ${i} (${children_ages[i]}) must be between 0 and 17 years` 
          };
        }
      }
    } else if (children_ages && children_ages.length > 0) {
      return { 
        isValid: false, 
        message: "Children ages provided but number of children is 0" 
      };
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
    endDate: Date,
    children_ages: number[]
  ): RateCalculationResult {

    try {
      // Calculate day-by-day rates
      const dayByDayCalculation = this.calculateDayByDayRates(
        inventory,
        noOfAdults,
        noOfChildrens,
        noOfRooms,
        startDate,
        endDate,
        children_ages
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
    startDate: Date,
    endDate: Date,
    children_ages: number[]
  ): any {

    try {
      const dailyBreakdown: any[] = [];
      let totalAmount = 0;
      let totalBaseAmount = 0;
      let totalAdditionalCharges = 0;

      // Generate array of dates for the stay
      const stayDates = this.generateDateRange(startDate, endDate);

      for (const currentDate of stayDates) {
        const dayOfWeek = this.getDayOfWeek(currentDate);
        let bestRateForDay: any = null;
        let lowestAmountForDay = Infinity;

        // Find all applicable rates for this specific date
        for (const item of inventory) {
          if (!item.rates || item.rates.length === 0) {
            continue;
          }

          for (const rate of item.rates) {
            // Check if rate is applicable for this specific date
            if (!this.isRateApplicableForDate(rate, currentDate, dayOfWeek)) {
              continue;
            }

            const rateCalculation = this.calculateSingleRateAmountForOneDay(
              rate,
              noOfAdults,
              noOfChildrens,
              noOfRooms,
              children_ages
            );

            if (rateCalculation.success && rateCalculation.totalAmountForDay < lowestAmountForDay) {
              lowestAmountForDay = rateCalculation.totalAmountForDay;
              bestRateForDay = {
                ...rateCalculation,
                ratePlanCode: rate.ratePlanCode,
                currencyCode: rate.currencyCode,
                date: currentDate
              };
            }
          }
        }

        if (!bestRateForDay) {
          return {
            success: false,
            message: `No suitable rates found for the date: ${currentDate.toDateString()}`
          };
        }

        // Add to daily breakdown
        dailyBreakdown.push({
          date: currentDate.toDateString(),
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

      const numberOfNights = stayDates.length;
      const averageBaseRate = totalBaseAmount / numberOfNights / noOfRooms;

      return {
        success: true,
        data: {
          totalAmount,
          averageBaseRate,
          totalAdditionalCharges: totalAdditionalCharges / numberOfNights,
          breakdown: {
            totalBaseAmount,
            totalAdditionalCharges,
            totalAmount,
            numberOfNights,
            averagePerNight: totalAmount / numberOfNights
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

  private static generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
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

  private static getAgeQualifyingCodeForChild(age: number): string {
    // Based on typical hotel industry age categories:
    // '7' - Infant (0-2 years)
    // '8' - Child (3-11 years) 
    // '10' - Adult (12+ years, but since we're dealing with children, this would be teens)
    
    if (age >= 0 && age <= 2) {
      return '7'; // Infant
    } else if (age >= 3 && age <= 11) {
      return '8'; // Child
    } else if (age >= 12 && age <= 17) {
      return '10'; // Teen (treated as adult for pricing but still a minor)
    } else {
      return '8'; // Default to child category for safety
    }
  }

  private static calculateSingleRateAmountForOneDay(
    rate: any,
    noOfAdults: number,
    noOfChildrens: number,
    noOfRooms: number,
    children_ages: number[]
  ): any {

    try {
      const totalGuests = noOfAdults + noOfChildrens;

      console.log('=== Rate Calculation Debug ===');
      console.log('Rate Plan Code:', rate.ratePlanCode);
      console.log('Adults:', noOfAdults, 'Children:', noOfChildrens, 'Children Ages:', children_ages);
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

      // Calculate additional charges only for guests exceeding base rate coverage
      let additionalAdultCharges = 0;
      let childrenChargesBreakdown: any[] = [];
      let totalChildrenCharges = 0;

      const additionalGuestAmounts: AdditionalGuestAmount[] = rate.additionalGuestAmounts || [];

      // Only calculate additional charges if total guests exceed base coverage
      if (totalGuests > baseGuestsIncluded) {
        console.log('Total guests exceed base coverage, calculating additional charges...');
        
        // CORRECTED LOGIC: Children always pay based on age (industry standard)
        if (noOfChildrens > 0 && children_ages && children_ages.length > 0) {
          console.log('Processing children charges...');
          for (let i = 0; i < children_ages.length; i++) {
            const childAge = children_ages[i];
            const ageQualifyingCode = this.getAgeQualifyingCodeForChild(childAge);
            
            console.log(`Child ${i + 1}: Age ${childAge} -> Age Qualifying Code: ${ageQualifyingCode}`);
            
            // Find the rate for this age category
            const childRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === ageQualifyingCode);
            
            if (childRate) {
              const chargeAmount = childRate.amount;
              totalChildrenCharges += chargeAmount;
              
              console.log(`Found rate for child: ${chargeAmount}`);
              
              childrenChargesBreakdown.push({
                childIndex: i + 1,
                age: childAge,
                ageQualifyingCode,
                chargeAmount
              });
            } else {
              // If no specific rate found, try to use child rate ('8') as fallback
              const fallbackChildRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '8');
              if (fallbackChildRate) {
                const chargeAmount = fallbackChildRate.amount;
                totalChildrenCharges += chargeAmount;
                
                console.log(`Using fallback child rate: ${chargeAmount}`);
                
                childrenChargesBreakdown.push({
                  childIndex: i + 1,
                  age: childAge,
                  ageQualifyingCode: '8',
                  chargeAmount,
                  note: 'Used fallback child rate'
                });
              } else {
                // Log warning but don't fail the calculation
                console.warn(`No rate found for child age ${childAge} with qualifying code ${ageQualifyingCode}`);
                childrenChargesBreakdown.push({
                  childIndex: i + 1,
                  age: childAge,
                  ageQualifyingCode,
                  chargeAmount: 0,
                  note: 'No applicable rate found - charged as free'
                });
              }
            }
          }
        }

        // CORRECTED LOGIC: Calculate additional adult charges for adults exceeding base coverage
        // Formula: (Total extra guests) - (Number of children) = Additional adults to charge
        const extraGuests = totalGuests - baseGuestsIncluded;
        const additionalAdultsToCharge = Math.max(0, extraGuests - noOfChildrens);
        
        console.log('Extra guests beyond base:', extraGuests);
        console.log('Additional adults to charge:', additionalAdultsToCharge);
        
        if (additionalAdultsToCharge > 0) {
          // Find adult rate (age qualifying code '10')
          const adultRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '10');
          if (adultRate) {
            additionalAdultCharges = additionalAdultsToCharge * adultRate.amount;
            console.log('Additional adult charges:', additionalAdultCharges);
          }
        }
      } else {
        console.log('All guests covered by base rate, no additional charges needed');
      }

      const totalAdditionalChargesPerRoom = additionalAdultCharges + totalChildrenCharges;
      const totalPerRoom = baseRatePerRoom + totalAdditionalChargesPerRoom;
      const totalAmountForDay = totalPerRoom * noOfRooms;

      console.log('Total Children Charges:', totalChildrenCharges);
      console.log('Total Additional Adult Charges:', additionalAdultCharges);
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
          additionalChildrenCharges: totalChildrenCharges,
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
