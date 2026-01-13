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



    const savedRatePlan = await RatePlanDao.create(finalRatePlanData);

    return {
      success: true,
      message: "Rate plan created successfully",
      data: savedRatePlan
    };
  }

  public static async updateRatePlan(ratePlanData: UpdatePlanData[]) {
    const updatedRatePlan = await RatePlanDao.updateRatePlan(ratePlanData);
    return {
      success: true,
      message: "Rate plan updated successfully",
      data: updatedRatePlan,
    };
  }

  public static async getRatePlanByHotelCode(hotelCode: string) {
    try {
      if (!hotelCode) {
        throw new Error("Hotel code is required");
      }
      const ratePlans = await RatePlanDao.getRatePlanByHotelCode(hotelCode);

      if (ratePlans.length === 0) {
        throw new Error("No rate plans found for this hotel code");
      }

      return {
        success: true,
        message: "Rate plans retrieved successfully",
        data: ratePlans,
      };
    } catch (error) {
      console.error("Error in getRatePlanByHotelCode:", error);
      throw error;
    }

  }

  public static async getRatePlanByHotel(
    hotelCode: string,
    invTypeCode?: string,
    ratePlanCode?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ) {

    try {

      if (!hotelCode || !page || !limit) {
        throw new Error("Hotel and inventory code is required");
      }

      const ratePlans = await RatePlanDao.getRatePlanByHotel(
        hotelCode,
        invTypeCode && invTypeCode,
        ratePlanCode && ratePlanCode,
        startDate && startDate,
        endDate && endDate,
        page && page,
        limit && limit
      );

      if (!ratePlans) {
        throw new Error("No rate plans found for this hotel code");
      }

      return {
        success: true,
        message: "Rate plans retrieved successfully",
        data: ratePlans,
      };
    } catch (error) {

    }
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

  public static async getAllRoomTypeService(hotelCode: string) {
    try {
      const responses = await RatePlanDao.getAllRoomType(hotelCode)
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

      if (availability.availability.count < noOfRooms) {
        return {
          success: true,
          isAvailable: false,
          message: `from ${startDate} to ${endDate} only ${availability.availability.count} room's are available`
        }
      } else {
        return {
          success: true,
          isAvailable: true,
          totalAvailableRooms: availability.availability.count,
          demandedRooms: noOfRooms
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
    // ratePlanCode: string,
    startDate: string,
    endDate: string,
    noOfChildren: number,
    noOfAdults: number,
    noOfRooms: number
  ): Promise<RateCalculationResult> {

    try {
      // Input validation

      const validationResult = this.validateInputs(
        hotelcode,
        invTypeCode,
        // ratePlanCode,
        startDate,
        endDate,
        noOfChildren,
        noOfAdults,
        noOfRooms
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message
        };
      }

      const startDate2 = startDate;
      const endDate2 = endDate;
      const start = startOfDay(startDate);
      const end = startOfDay(endDate);
      const numberOfNights = differenceInDays(end, start);

      if (numberOfNights <= 0) {
        return {
          success: false,
          message: "End date must be after start date"
        };
      }

      // Get inventory with rates
      const inventory = await HotelPricesDao.getInventoryWithRates(
        hotelcode,
        invTypeCode,
        noOfChildren,
        noOfAdults,
        noOfRooms,
        new Date(startDate2),
        endOfDay(endDate2)

      );

      if (!inventory || inventory.length === 0) {
        return {
          success: false,
          message: "No rooms are available for the selected dates"
        };
      }

      const availableRooms: number[] = [];
      inventory.forEach((i) => {
        if (i.inventory?.availability?.count && i.inventory.availability.count > 0) {
          availableRooms.push(i.inventory.availability.count);
        }
      });



      let minimumRoomAvailable = 0;
      if (availableRooms.length > 0) {
        minimumRoomAvailable = Math.min(...availableRooms);


        if (minimumRoomAvailable < noOfRooms) {
          return {
            success: false,
            message: `Only ${minimumRoomAvailable} rooms available, but ${noOfRooms} rooms requested from ${start.toDateString()} to ${end.toDateString()}`
          };
        }
      } else {
        console.log('No availability data found, proceeding with rate calculation only');
        minimumRoomAvailable = noOfRooms;
      }

      // Calculate total rent day-by-day
      const rateCalculation = this.calculateRoomRates(
        inventory,
        noOfAdults,
        noOfChildren,
        noOfRooms,
        numberOfNights,
        start,
        end
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

  /**
   * Helper method to validate inputs
   * @param hotelcode 
   * @param invTypeCode 
   * @param startDate 
   * @param endDate 
   * @param noOfChildren 
   * @param noOfAdults 
   * @param noOfRooms 
   * @returns 
   */
  private static validateInputs(
    hotelcode: string,
    invTypeCode: string,
    // ratePlanCode: string,
    startDate: string,
    endDate: string,
    noOfChildren: number,
    noOfAdults: number,
    noOfRooms: number
  ): { isValid: boolean; message?: string } {

    // if (!hotelcode || !invTypeCode || !ratePlanCode) {
    if (!hotelcode || !invTypeCode) {
      return { isValid: false, message: "Hotel code, inventory type code and rate plan code are required" };
    }

    if (!startDate || !endDate) {
      return { isValid: false, message: "Start date and end date are required" };
    }

    if (noOfAdults < 1) {
      return { isValid: false, message: "At least 1 adult is required" };
    }

    if (noOfChildren < 0) {
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
    noOfChildren: number,
    noOfRooms: number,
    numberOfNights: number,
    startDate: Date,
    endDate: Date
  ): RateCalculationResult {

    try {
      // Calculate day-by-day rates
      const dayByDayCalculation = this.calculateDayByDayRates(
        inventory,
        noOfAdults,
        noOfChildren,
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

  /**
 * Helper method to calculate day-by-day rates
 */
  private static calculateDayByDayRates(
    inventory: any[],
    noOfAdults: number,
    noOfChildren: number,
    noOfRooms: number,
    numberOfNights: number,
    startDate: Date,
    endDate: Date
  ): any {

    console.log('=== calculateDayByDayRates START ===');
    console.log({
      inventory,
      noOfAdults,
      noOfChildren,
      noOfRooms,
      numberOfNights,
      startDate,
      endDate
    });

    try {
      const dailyBreakdown: any[] = [];
      let totalAmount = 0;
      let totalBaseAmount = 0;
      let totalAdditionalCharges = 0;

      console.log('Initial totals', {
        totalAmount,
        totalBaseAmount,
        totalAdditionalCharges
      });

      // Generate stay dates (exclude checkout day)
      const currentDate = new Date(startDate);
      const stayDates: Date[] = [];

      console.log('Generating stay dates...');

      while (currentDate < endDate) {
        stayDates.push(new Date(currentDate));
        console.log('Added stay date:', currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('Final stayDates:', stayDates);

      for (const date of stayDates) {
        const dayOfWeek = this.getDayOfWeek(date);

        console.log('--- Processing date ---');
        console.log({ date, dayOfWeek });

        let bestRateForDay: any = null;
        let lowestAmountForDay = Infinity;
        let applicableRatesCount = 0;

        for (const item of inventory) {
          console.log('Checking inventory item:', item);

          if (!item.rate) {
            console.log('No rate found for inventory item');
            continue;
          }

          const rate = item.rate;
          console.log('Rate found:', rate);

          // const isApplicable = this.isRateApplicableForDate(rate, date, dayOfWeek);
          // console.log('Is rate applicable?', {
          //   ratePlanCode: rate.ratePlanCode,
          //   isApplicable
          // });

          // if (!isApplicable) {
          //   continue;
          // }

          applicableRatesCount++;
          console.log('Applicable rates count:', applicableRatesCount);

          const rateCalculation = this.calculateSingleRateAmountForOneDay(
            rate,
            noOfAdults,
            noOfChildren,
            noOfRooms
          );

          console.log('Rate calculation result:', rateCalculation);

          if (
            rateCalculation.success &&
            rateCalculation.totalAmountForDay < lowestAmountForDay
          ) {
            lowestAmountForDay = rateCalculation.totalAmountForDay;
            bestRateForDay = {
              ...rateCalculation,
              ratePlanCode: rate.ratePlanCode,
              currencyCode: rate.currencyCode,
              date: date
            };

            console.log('🔥 New best rate selected:', bestRateForDay);
          }
        }

        console.log('Applicable rates total:', applicableRatesCount);

        if (!bestRateForDay) {
          console.error(`ERROR: No suitable rates found for ${date.toDateString()}`);
          return {
            success: false,
            message: `No suitable rates found for the date: ${date.toDateString()}`
          };
        }

        const dailyEntry = {
          date: date.toDateString(),
          dayOfWeek,
          ratePlanCode: bestRateForDay.ratePlanCode,
          baseRate: bestRateForDay.baseRatePerRoom,
          additionalCharges: bestRateForDay.additionalGuestCharges,
          totalPerRoom: bestRateForDay.totalPerRoom,
          totalForAllRooms: bestRateForDay.totalAmountForDay,
          currencyCode: bestRateForDay.currencyCode,
          childrenChargesBreakdown: bestRateForDay.childrenChargesBreakdown,
          detailedBreakdown: bestRateForDay.breakdown
        };

        console.log('Daily breakdown entry:', dailyEntry);

        dailyBreakdown.push(dailyEntry);

        totalAmount += bestRateForDay.totalAmountForDay;
        totalBaseAmount += bestRateForDay.baseRatePerRoom * noOfRooms;
        totalAdditionalCharges += bestRateForDay.additionalGuestCharges * noOfRooms;

        console.log('Updated totals:', {
          totalAmount,
          totalBaseAmount,
          totalAdditionalCharges
        });
      }

      const averageBaseRate =
        numberOfNights > 0 ? totalBaseAmount / numberOfNights / noOfRooms : 0;

      console.log('Final calculations:', {
        totalAmount,
        totalBaseAmount,
        totalAdditionalCharges,
        averageBaseRate,
        numberOfNights
      });

      console.log('=== calculateDayByDayRates SUCCESS ===');

      return {
        success: true,
        data: {
          totalAmount,
          averageBaseRate,
          totalAdditionalCharges,
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
      console.error('❌ Error in calculateDayByDayRates:', error);
      return {
        success: false,
        message: 'Error calculating day-by-day rates'
      };
    }
  }


  private static getDayOfWeek(date: Date): string {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[date.getDay()];
  }

  // private static isRateApplicableForDate(
  //   rate: any,
  //   date: Date,
  //   dayOfWeek: string
  // ): boolean {

  //   console.log('=== isRateApplicableForDate START ===');
  //   console.log({
  //     rate,
  //     inputDate: date,
  //     dayOfWeek
  //   });

  //   // Normalize dates to compare only the date part (ignore time)
  //   const rateStartDate = new Date(rate.startDate);
  //   const checkDate = new Date(date);

  //   rateStartDate.setHours(0, 0, 0, 0);
  //   checkDate.setHours(0, 0, 0, 0);

  //   console.log('Normalized dates:', {
  //     rateStartDate,
  //     checkDate
  //   });

  //   // Check if the rate's start date matches the query date
  //   if (checkDate.getTime() !== rateStartDate.getTime()) {
  //     console.log('❌ Date check FAILED', {
  //       expected: rateStartDate.toDateString(),
  //       received: checkDate.toDateString()
  //     });
  //     return false;
  //   }

  //   console.log('✅ Date check PASSED');

  //   // Check if the rate applies to this day of the week
  //   if (rate.days && typeof rate.days === 'object') {
  //     const dayApplicable = rate.days[dayOfWeek];

  //     console.log('Day-of-week config:', {
  //       daysConfig: rate.days,
  //       dayOfWeek,
  //       dayApplicable
  //     });

  //     if (dayApplicable === false) {
  //       console.log('❌ Day-of-week check FAILED');
  //       return false;
  //     }
  //   } else {
  //     console.log('No day-of-week restriction found');
  //   }

  //   console.log('✅ Day-of-week check PASSED');
  //   console.log('=== isRateApplicableForDate RESULT: TRUE ===');

  //   return true;
  // }

  private static calculateSingleRateAmountForOneDay(
    rate: any,
    noOfAdults: number,
    noOfChildren: number,
    noOfRooms: number
  ): any {

    try {
      const totalGuests = noOfAdults + noOfChildren;

      // Find the appropriate base rate
      const baseByGuestAmts: BaseGuestAmount[] = rate.baseByGuestAmts || [];

      if (baseByGuestAmts.length === 0) {
        console.log('    ERROR: No base guest amounts found');
        return {
          success: false,
          message: "No base guest amounts found for this rate"
        };
      }

      // Sort base rates by number of guests (ascending)
      const sortedBaseRates = baseByGuestAmts.sort((a, b) => a.numberOfGuests - b.numberOfGuests);

      // Find the highest base rate available (this covers the maximum guests per room)
      const highestBaseRate = sortedBaseRates[sortedBaseRates.length - 1];
      const baseRatePerRoom = highestBaseRate.amountBeforeTax;
      const baseGuestsIncludedPerRoom = highestBaseRate.numberOfGuests;

      // Calculate total guests that can be accommodated by base rates across all rooms
      const totalBaseGuestsIncluded = baseGuestsIncludedPerRoom * noOfRooms;

      let additionalAdultCharges = 0;
      let additionalChildrenCharges = 0;
      let childrenChargesBreakdown: any[] = [];

      const additionalGuestAmounts: AdditionalGuestAmount[] = rate.additionalGuestAmounts || [];

      console.log('=== DEBUGGING ADDITIONAL CHARGES CALCULATION ===');
      console.log(`    Total Guests: ${totalGuests} (${noOfAdults} adults + ${noOfChildren} children)`);
      console.log(`    Base Capacity: ${baseGuestsIncludedPerRoom} guests/room × ${noOfRooms} rooms = ${totalBaseGuestsIncluded} total base guests`);

      // Calculate additional charges if total guests exceed base capacity
      if (totalGuests > totalBaseGuestsIncluded) {
        const extraGuests = totalGuests - totalBaseGuestsIncluded;
        console.log(`    Extra guests beyond base capacity: ${extraGuests}`);

        // Find adult additional rate
        const adultRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '10');
        const childRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '8');

        console.log(`    Adult Rate:`, adultRate);
        console.log(`    Child Rate:`, childRate);

        // Calculate how many extra adults and children
        // First, see how many adults can be covered by base rates
        const adultsCoveredByBase = Math.min(noOfAdults, totalBaseGuestsIncluded);
        const extraAdults = noOfAdults - adultsCoveredByBase;

        // Then calculate extra children (remaining guests after accounting for adults)
        const remainingBaseCapacity = totalBaseGuestsIncluded - adultsCoveredByBase;
        const childrenCoveredByBase = Math.min(noOfChildren, remainingBaseCapacity);
        const extraChildren = noOfChildren - childrenCoveredByBase;

        console.log(`    Extra adults: ${extraAdults}, Extra children: ${extraChildren}`);

        // Calculate additional charges for extra adults
        if (extraAdults > 0 && adultRate) {
          additionalAdultCharges = extraAdults * adultRate.amount;
          console.log(`    Additional adult charges: ${extraAdults} × ${adultRate.amount} = ${additionalAdultCharges}`);
        }

        // Calculate additional charges for extra children
        if (extraChildren > 0 && childRate) {
          additionalChildrenCharges = extraChildren * childRate.amount;
          console.log(`    Additional children charges: ${extraChildren} × ${childRate.amount} = ${additionalChildrenCharges}`);
        }

        // Create children charges breakdown
        for (let i = 0; i < noOfChildren; i++) {
          const isCharged = i >= childrenCoveredByBase;
          childrenChargesBreakdown.push({
            childIndex: i + 1,
            ageQualifyingCode: '8',
            chargeAmount: isCharged && childRate ? childRate.amount : 0,
            note: isCharged ? 'Additional charge beyond base rate' : 'Covered by base rate'
          });
        }

      } else {
        console.log('    All guests covered by base rate');
        // All guests covered by base rate
        for (let i = 0; i < noOfChildren; i++) {
          childrenChargesBreakdown.push({
            childIndex: i + 1,
            ageQualifyingCode: '8',
            chargeAmount: 0,
            note: 'Covered by base rate'
          });
        }
      }

      // Calculate total additional charges (NOT distributed per room - this is the total extra charge)
      const totalAdditionalCharges = additionalAdultCharges + additionalChildrenCharges;

      // Calculate base amount for all rooms
      const totalBaseAmount = baseRatePerRoom * noOfRooms;

      // Total amount for the day = base amount + additional charges
      const totalAmountForDay = totalBaseAmount + totalAdditionalCharges;

      // Calculate per room amounts for display
      const totalPerRoom = totalAmountForDay / noOfRooms;
      const additionalChargesPerRoom = totalAdditionalCharges / noOfRooms;

      console.log(`    Final calculation: Base=${totalBaseAmount} + Additional=${totalAdditionalCharges} = ${totalAmountForDay} total for ${noOfRooms} rooms`);
      console.log(`    Per room: ${totalPerRoom} (Base: ${baseRatePerRoom} + Additional: ${additionalChargesPerRoom})`);
      console.log('=== END DEBUGGING ===');

      return {
        success: true,
        baseRatePerRoom,
        additionalGuestCharges: additionalChargesPerRoom, // For display purposes only
        totalPerRoom,
        totalAmountForDay,
        childrenChargesBreakdown,
        breakdown: {
          baseAmount: baseRatePerRoom,
          additionalAdultCharges,
          additionalChildrenCharges,
          totalAdditionalCharges: additionalChargesPerRoom, // For display purposes only
          baseGuestsIncluded: baseGuestsIncludedPerRoom,
          totalBaseGuestsIncluded,
          extraGuests: Math.max(0, totalGuests - totalBaseGuestsIncluded),
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