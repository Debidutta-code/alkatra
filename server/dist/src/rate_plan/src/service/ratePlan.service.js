"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRentCalculationService = exports.RoomPriceService = exports.RatePlanService = void 0;
const date_fns_1 = require("date-fns");
const ratePlan_dao_1 = require("../dao/ratePlan.dao");
const hotelPrices_dao_1 = require("../dao/hotelPrices.dao");
class RatePlanService {
    static createRatePlan(ratePlanData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, weeklyDays, dateRanges, availableSpecificDates } = ratePlanData, rest = __rest(ratePlanData, ["type", "weeklyDays", "dateRanges", "availableSpecificDates"]);
            const finalRatePlanData = Object.assign(Object.assign({}, rest), { scheduling: {
                    type,
                    weeklyDays,
                    dateRanges,
                    availableSpecificDates
                } });
            // console.log("finalRatePlanData", finalRatePlanData);
            const savedRatePlan = yield ratePlan_dao_1.RatePlanDao.create(finalRatePlanData);
            return {
                success: true,
                message: "Rate plan created successfully",
                data: savedRatePlan
            };
        });
    }
    static updateRatePlan(ratePlanData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedRatePlan = yield ratePlan_dao_1.RatePlanDao.updateRatePlan(ratePlanData);
            return {
                success: true,
                message: "Rate plan updated successfully",
                data: updatedRatePlan,
            };
        });
    }
    static getRatePlanByHotel(hotelCode, invTypeCode, startDate, endDate, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const ratePlans = yield ratePlan_dao_1.RatePlanDao.getRatePlanByHotel(hotelCode, invTypeCode && invTypeCode, startDate && startDate, endDate && endDate, page && page);
            // console.log(ratePlans)
            return {
                success: true,
                message: "Rate plans retrieved successfully",
                data: ratePlans,
            };
        });
    }
    static getRatePlanByHotelCode(hotelCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const ratePlans = yield ratePlan_dao_1.RatePlanDao.getRatePlanByHotelCode(hotelCode);
            if (ratePlans.length === 0)
                throw new Error("No rate plans found for this hotel code");
            return {
                success: true,
                message: "Rate plans retrieved successfully",
                data: ratePlans,
            };
        });
    }
}
exports.RatePlanService = RatePlanService;
class RoomPriceService {
    static getRoomPriceService(hotelCode, invTypeCode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const dbResults = yield hotelPrices_dao_1.HotelPricesDao.getHotelPlans(hotelCode, invTypeCode);
                if (!((_b = (_a = dbResults[0]) === null || _a === void 0 ? void 0 : _a.baseByGuestAmts[dbResults[0].baseByGuestAmts.length - 1]) === null || _b === void 0 ? void 0 : _b.amountBeforeTax)) {
                    new Error("Price not found");
                }
                return {
                    success: true,
                    pricePerNight: (_d = (_c = dbResults[0]) === null || _c === void 0 ? void 0 : _c.baseByGuestAmts[dbResults[0].baseByGuestAmts.length - 1]) === null || _d === void 0 ? void 0 : _d.amountBeforeTax
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: error === null || error === void 0 ? void 0 : error.message
                };
            }
        });
    }
    static getAllRoomTypeService() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const responses = yield ratePlan_dao_1.RatePlanDao.getAllRoomType();
                return {
                    success: true,
                    roomTypes: responses
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: error.message
                };
            }
        });
    }
    static checkAvailabilityService(hotelcode, invTypeCode, startDate, endDate, noOfRooms) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const availability = yield hotelPrices_dao_1.HotelPricesDao.checkAvailabilityDao(hotelcode, invTypeCode, startDate, endDate);
                console.log("availability", availability);
                if (availability.availability.count < noOfRooms) {
                    return {
                        success: true,
                        isAvailable: false,
                        message: `from ${startDate} to ${endDate} only ${availability.availability.count} room's are available`
                    };
                }
                else {
                    return {
                        success: true,
                        isAvailable: true,
                        totalAvailableRooms: availability.availability.count,
                        demandedRooms: noOfRooms
                    };
                }
            }
            catch (error) {
                return {
                    success: false,
                    message: "Error occur while checking availability ",
                    error: error.message,
                };
            }
        });
    }
}
exports.RoomPriceService = RoomPriceService;
class RoomRentCalculationService {
    static getRoomRentService(hotelcode, invTypeCode, startDate, endDate, noOfChildrens, noOfAdults, noOfRooms) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Input validation
                console.log(`The data we get in RatePlanService:${hotelcode}, ${invTypeCode}, ${startDate}, ${endDate}, ${noOfChildrens}, ${noOfAdults}, ${noOfRooms}`);
                const validationResult = this.validateInputs(hotelcode, invTypeCode, startDate, endDate, noOfChildrens, noOfAdults, noOfRooms);
                if (!validationResult.isValid) {
                    return {
                        success: false,
                        message: validationResult.message
                    };
                }
                const startDate2 = startDate;
                const endDate2 = endDate;
                const start = (0, date_fns_1.startOfDay)(startDate);
                const end = (0, date_fns_1.startOfDay)(endDate);
                const numberOfNights = (0, date_fns_1.differenceInDays)(end, start);
                if (numberOfNights <= 0) {
                    return {
                        success: false,
                        message: "End date must be after start date"
                    };
                }
                console.log('=== Service Debug Info ===');
                console.log('Hotel Code:', hotelcode);
                console.log('Inv Type Code:', invTypeCode);
                console.log('Original Start Date:', startDate2);
                console.log('Original End Date:', endDate2);
                console.log('Processed Start Date:', start);
                console.log('Processed End Date:', end);
                console.log('Number of Nights:', numberOfNights);
                // Get inventory with rates
                const inventory = yield hotelPrices_dao_1.HotelPricesDao.getInventoryWithRates(hotelcode, invTypeCode, new Date(startDate2), (0, date_fns_1.endOfDay)(endDate2));
                console.log('=== Inventory Data Debug ===');
                console.log('Inventory Length:', inventory === null || inventory === void 0 ? void 0 : inventory.length);
                if (inventory && inventory.length > 0) {
                    inventory.forEach((item, index) => {
                        var _a, _b, _c;
                        console.log(`Inventory Item ${index}:`, {
                            hotelCode: item.hotelCode,
                            invTypeCode: item.invTypeCode,
                            availability: (_a = item.inventory) === null || _a === void 0 ? void 0 : _a.availability,
                            rateExists: !!item.rate,
                            rateDetails: item.rate ? {
                                ratePlanCode: item.rate.ratePlanCode,
                                startDate: item.rate.startDate,
                                endDate: item.rate.endDate,
                                days: item.rate.days,
                                baseByGuestAmts: ((_b = item.rate.baseByGuestAmts) === null || _b === void 0 ? void 0 : _b.length) || 0,
                                additionalGuestAmounts: ((_c = item.rate.additionalGuestAmounts) === null || _c === void 0 ? void 0 : _c.length) || 0
                            } : null
                        });
                    });
                }
                if (!inventory || inventory.length === 0) {
                    return {
                        success: false,
                        message: "No rooms are available for the selected dates"
                    };
                }
                const availableRooms = [];
                inventory.forEach((i) => {
                    var _a, _b;
                    if (((_b = (_a = i.inventory) === null || _a === void 0 ? void 0 : _a.availability) === null || _b === void 0 ? void 0 : _b.count) && i.inventory.availability.count > 0) {
                        availableRooms.push(i.inventory.availability.count);
                    }
                });
                console.log('Available Rooms Array:', availableRooms);
                let minimumRoomAvailable = 0;
                if (availableRooms.length > 0) {
                    minimumRoomAvailable = Math.min(...availableRooms);
                    console.log('Minimum Room Available:', minimumRoomAvailable);
                    if (minimumRoomAvailable < noOfRooms) {
                        return {
                            success: false,
                            message: `Only ${minimumRoomAvailable} rooms available, but ${noOfRooms} rooms requested from ${start.toDateString()} to ${end.toDateString()}`
                        };
                    }
                }
                else {
                    console.log('No availability data found, proceeding with rate calculation only');
                    minimumRoomAvailable = noOfRooms;
                }
                // Calculate total rent day-by-day
                const rateCalculation = this.calculateRoomRates(inventory, noOfAdults, noOfChildrens, noOfRooms, numberOfNights, start, end);
                if (!rateCalculation.success) {
                    return rateCalculation;
                }
                return {
                    success: true,
                    data: Object.assign(Object.assign({}, rateCalculation.data), { availableRooms: minimumRoomAvailable, requestedRooms: noOfRooms, numberOfNights })
                };
            }
            catch (error) {
                console.error('Error in getRoomRentService:', error);
                return {
                    success: false,
                    message: "An error occurred while calculating room rates"
                };
            }
        });
    }
    static validateInputs(hotelcode, invTypeCode, startDate, endDate, noOfChildrens, noOfAdults, noOfRooms) {
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
    static calculateRoomRates(inventory, noOfAdults, noOfChildrens, noOfRooms, numberOfNights, startDate, endDate) {
        try {
            // Calculate day-by-day rates
            const dayByDayCalculation = this.calculateDayByDayRates(inventory, noOfAdults, noOfChildrens, noOfRooms, numberOfNights, startDate, endDate);
            if (!dayByDayCalculation.success) {
                return dayByDayCalculation;
            }
            return {
                success: true,
                data: {
                    totalAmount: dayByDayCalculation.data.totalAmount,
                    numberOfNights,
                    baseRatePerNight: dayByDayCalculation.data.averageBaseRate,
                    additionalGuestCharges: dayByDayCalculation.data.totalAdditionalCharges,
                    breakdown: dayByDayCalculation.data.breakdown,
                    dailyBreakdown: dayByDayCalculation.data.dailyBreakdown,
                    availableRooms: 0,
                    requestedRooms: 0
                }
            };
        }
        catch (error) {
            console.error('Error in calculateRoomRates:', error);
            return {
                success: false,
                message: "Error calculating room rates"
            };
        }
    }
    static calculateDayByDayRates(inventory, noOfAdults, noOfChildrens, noOfRooms, numberOfNights, startDate, endDate) {
        try {
            console.log('=== Day by Day Calculation Debug ===');
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);
            console.log('Number of Nights:', numberOfNights);
            console.log('Adults:', noOfAdults, 'Children:', noOfChildrens, 'Rooms:', noOfRooms);
            const dailyBreakdown = [];
            let totalAmount = 0;
            let totalBaseAmount = 0;
            let totalAdditionalCharges = 0;
            // Generate stay dates (exclude checkout day)
            const currentDate = new Date(startDate);
            const stayDates = [];
            while (currentDate < endDate) {
                stayDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            console.log(`Generated ${stayDates.length} nights:`, stayDates.map(d => d.toDateString()));
            for (const date of stayDates) {
                console.log(`\n=== Processing Date: ${date.toDateString()} ===`);
                const dayOfWeek = this.getDayOfWeek(date);
                console.log('Day of Week:', dayOfWeek);
                let bestRateForDay = null;
                let lowestAmountForDay = Infinity;
                let applicableRatesCount = 0;
                for (const item of inventory) {
                    if (!item.rate) {
                        console.log('No rate found for inventory item');
                        continue;
                    }
                    console.log(`Checking rate for this date...`);
                    const rate = item.rate;
                    const isApplicable = this.isRateApplicableForDate(rate, date, dayOfWeek);
                    console.log(`Rate ${rate.ratePlanCode} (${rate.startDate} to ${rate.endDate}):`, isApplicable ? 'APPLICABLE' : 'NOT APPLICABLE');
                    if (!isApplicable) {
                        continue;
                    }
                    applicableRatesCount++;
                    const rateCalculation = this.calculateSingleRateAmountForOneDay(rate, noOfAdults, noOfChildrens, noOfRooms);
                    console.log(`Rate calculation result:`, {
                        success: rateCalculation.success,
                        totalAmount: rateCalculation.success ? rateCalculation.totalAmountForDay : 'FAILED'
                    });
                    if (rateCalculation.success && rateCalculation.totalAmountForDay < lowestAmountForDay) {
                        lowestAmountForDay = rateCalculation.totalAmountForDay;
                        bestRateForDay = Object.assign(Object.assign({}, rateCalculation), { ratePlanCode: rate.ratePlanCode, currencyCode: rate.currencyCode, date: date });
                        console.log(`New best rate found: ${rate.ratePlanCode} with total ${lowestAmountForDay}`);
                    }
                }
                console.log(`Total applicable rates for ${date.toDateString()}: ${applicableRatesCount}`);
                if (!bestRateForDay) {
                    console.log(`ERROR: No suitable rates found for ${date.toDateString()}`);
                    return {
                        success: false,
                        message: `No suitable rates found for the date: ${date.toDateString()}`
                    };
                }
                console.log(`Selected rate for ${date.toDateString()}:`, {
                    ratePlanCode: bestRateForDay.ratePlanCode,
                    totalAmount: bestRateForDay.totalAmountForDay
                });
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
            console.log('=== Final Calculation Results ===');
            console.log('Total Amount:', totalAmount);
            console.log('Total Base Amount:', totalBaseAmount);
            console.log('Total Additional Charges:', totalAdditionalCharges);
            console.log('Daily Breakdown Length:', dailyBreakdown.length);
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
        }
        catch (error) {
            console.error('Error in calculateDayByDayRates:', error);
            return {
                success: false,
                message: "Error calculating day-by-day rates"
            };
        }
    }
    static getDayOfWeek(date) {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return days[date.getDay()];
    }
    static isRateApplicableForDate(rate, date, dayOfWeek) {
        // Normalize dates to compare only the date part (ignore time)
        const rateStartDate = new Date(rate.startDate);
        const checkDate = new Date(date);
        // Set all times to start of day for accurate comparison
        rateStartDate.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);
        console.log(`  Date Check: Rate Start Date (${rateStartDate.toDateString()}) vs Check Date (${checkDate.toDateString()})`);
        // Only check if the rate's start date matches the query date (ignore end date)
        if (checkDate.getTime() !== rateStartDate.getTime()) {
            console.log(`  Date check: FAILED - Rate start date doesn't match query date`);
            return false;
        }
        console.log(`  Date check: PASSED - Rate start date matches query date`);
        // Check if the rate applies to this day of the week
        if (rate.days && typeof rate.days === 'object') {
            const dayApplicable = rate.days[dayOfWeek];
            console.log(`  Day of week check: ${dayOfWeek} = ${dayApplicable}`);
            if (dayApplicable === false) {
                console.log(`  Day of week check: FAILED`);
                return false;
            }
        }
        console.log(`  Day of week check: PASSED`);
        return true;
    }
    static calculateSingleRateAmountForOneDay(rate, noOfAdults, noOfChildrens, noOfRooms) {
        try {
            const totalGuests = noOfAdults + noOfChildrens;
            console.log('    === Single Rate Calculation Debug (ENHANCED) ===');
            console.log('    Rate Plan Code:', rate.ratePlanCode);
            console.log('    Adults:', noOfAdults, 'Children:', noOfChildrens, 'Total Guests:', totalGuests, 'Rooms:', noOfRooms);
            // Find the appropriate base rate
            const baseByGuestAmts = rate.baseByGuestAmts || [];
            if (baseByGuestAmts.length === 0) {
                console.log('    ERROR: No base guest amounts found');
                return {
                    success: false,
                    message: "No base guest amounts found for this rate"
                };
            }
            console.log('    Available base rates:', baseByGuestAmts.map(b => `${b.numberOfGuests} guests = ${b.amountBeforeTax}`));
            // Sort base rates by number of guests (ascending)
            const sortedBaseRates = baseByGuestAmts.sort((a, b) => a.numberOfGuests - b.numberOfGuests);
            // FIXED: Better base rate selection logic
            let selectedBaseRate = null;
            // Find the base rate that covers the most guests without exceeding total guests
            // OR if we have more guests than any base rate covers, use the highest base rate
            const maxBaseRateGuests = Math.max(...sortedBaseRates.map(r => r.numberOfGuests));
            if (totalGuests <= maxBaseRateGuests) {
                // Find the smallest base rate that covers all our guests
                selectedBaseRate = sortedBaseRates.find(rate => rate.numberOfGuests >= totalGuests) || null;
            }
            else {
                // Use the highest base rate available
                selectedBaseRate = sortedBaseRates[sortedBaseRates.length - 1];
            }
            // Fallback to lowest rate if no suitable rate found
            if (!selectedBaseRate) {
                selectedBaseRate = sortedBaseRates[0];
            }
            const baseRatePerRoom = selectedBaseRate.amountBeforeTax;
            const baseGuestsIncluded = selectedBaseRate.numberOfGuests;
            console.log('    Selected Base Rate:', {
                numberOfGuests: selectedBaseRate.numberOfGuests,
                amount: baseRatePerRoom,
                covers: `${baseGuestsIncluded} guests included in base rate`
            });
            // FIXED: Better additional charges calculation
            let additionalAdultCharges = 0;
            let additionalChildrenCharges = 0;
            let childrenChargesBreakdown = [];
            const additionalGuestAmounts = rate.additionalGuestAmounts || [];
            console.log('    Additional guest amounts available:', additionalGuestAmounts.map(a => `Code ${a.ageQualifyingCode} = ${a.amount}`));
            // FIXED: More accurate calculation of who pays additional charges
            if (totalGuests > baseGuestsIncluded) {
                console.log('    Total guests exceed base coverage, calculating additional charges...');
                const extraGuests = totalGuests - baseGuestsIncluded;
                console.log('    Extra guests beyond base coverage:', extraGuests);
                // Strategy: First accommodate adults in base rate, then charge for extra adults and all children
                let guestsAccountedFor = 0;
                let extraAdults = 0;
                let extraChildren = 0;
                // If base rate can cover all adults, children pay extra
                if (baseGuestsIncluded >= noOfAdults) {
                    extraAdults = 0;
                    extraChildren = Math.min(noOfChildrens, extraGuests);
                    console.log('    Base rate covers all adults. Extra children to charge:', extraChildren);
                }
                else {
                    // Base rate can't cover all adults, so some adults and all children pay extra
                    extraAdults = noOfAdults - baseGuestsIncluded;
                    extraChildren = noOfChildrens;
                    console.log('    Base rate cannot cover all adults. Extra adults:', extraAdults, 'Extra children:', extraChildren);
                }
                // Calculate additional adult charges
                if (extraAdults > 0) {
                    const adultRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '10');
                    if (adultRate) {
                        additionalAdultCharges = extraAdults * adultRate.amount;
                        console.log(`    Additional adults: ${extraAdults} x ${adultRate.amount} = ${additionalAdultCharges}`);
                    }
                    else {
                        console.log('    No adult additional rate found - extra adults will be free');
                    }
                }
                // Calculate children charges
                if (extraChildren > 0) {
                    const childRate = additionalGuestAmounts.find(aga => aga.ageQualifyingCode === '8');
                    if (childRate) {
                        additionalChildrenCharges = extraChildren * childRate.amount;
                        console.log(`    Children charges: ${extraChildren} x ${childRate.amount} = ${additionalChildrenCharges}`);
                        // Add breakdown for charged children
                        for (let i = 0; i < extraChildren; i++) {
                            childrenChargesBreakdown.push({
                                childIndex: i + 1,
                                ageQualifyingCode: '8',
                                chargeAmount: childRate.amount,
                                note: 'Additional charge beyond base rate'
                            });
                        }
                        // Add breakdown for free children (if any)
                        for (let i = extraChildren; i < noOfChildrens; i++) {
                            childrenChargesBreakdown.push({
                                childIndex: i + 1,
                                ageQualifyingCode: '8',
                                chargeAmount: 0,
                                note: 'Covered by base rate'
                            });
                        }
                    }
                    else {
                        console.log('    No child rate found - children will be free');
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
                else {
                    // All children covered by base rate
                    for (let i = 0; i < noOfChildrens; i++) {
                        childrenChargesBreakdown.push({
                            childIndex: i + 1,
                            ageQualifyingCode: '8',
                            chargeAmount: 0,
                            note: 'Covered by base rate'
                        });
                    }
                }
            }
            else {
                console.log('    All guests covered by base rate');
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
            console.log('    === FINAL CALCULATION BREAKDOWN ===');
            console.log('    Base rate per room:', baseRatePerRoom);
            console.log('    Additional adult charges per room:', additionalAdultCharges);
            console.log('    Additional children charges per room:', additionalChildrenCharges);
            console.log('    Total additional charges per room:', totalAdditionalChargesPerRoom);
            console.log('    Total per room:', totalPerRoom);
            console.log('    Number of rooms:', noOfRooms);
            console.log('    Total for all rooms:', totalAmountForDay);
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
        }
        catch (error) {
            console.error('Error in calculateSingleRateAmountForOneDay:', error);
            return {
                success: false,
                message: "Error calculating single day rate amount"
            };
        }
    }
}
exports.RoomRentCalculationService = RoomRentCalculationService;
//# sourceMappingURL=ratePlan.service.js.map