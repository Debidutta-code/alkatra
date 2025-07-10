import { Response } from 'express';
import { Inventory, IInventory } from '../model/inventoryModel';
import { AnyBulkWriteOperation } from 'mongoose';


export const reduceRoomsAfterBookingConfirmed = async (
  res: Response,
  hotelCode: string,
  roomTypeCode: string,
  numberOfRooms: number,
  dates: Date[]
) => {
  console.log(`Get data for reduce rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

  const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
  const missingFields = Object.entries(requiredFields)
    .filter(
      ([key, value]) =>
        value === undefined ||
        value === null ||
        value === '' ||
        (key === 'dates' && (!Array.isArray(value) || value.length !== 2 || !value.every(d => d instanceof Date && !isNaN(d.getTime()))))
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing or invalid required fields: ${missingFields.join(', ')}`,
    });
  }

  const [checkInDate, checkOutDate] = dates;

  if (checkInDate > checkOutDate) {
    return res.status(400).json({
      message: 'Check-in date must be before or equal to check-out date',
    });
  }

  try {
    const inventoryRecords = await Inventory.find({
      hotelCode,
      invTypeCode: roomTypeCode,
      'availability.startDate': {
        $gte: new Date(checkInDate),
        $lte: new Date(checkOutDate),
      },
    });

    if (!inventoryRecords || inventoryRecords.length === 0) {
      return res.status(404).json({ message: 'No available rooms found for the specified criteria' });
    }

    const bulkOps: AnyBulkWriteOperation<IInventory>[] = [];

    for (const item of inventoryRecords) {
      const currentCount = item.availability?.count || 0;
      if (currentCount < numberOfRooms) {
        return res.status(400).json({
          message: `Not enough rooms for date ${item.availability?.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`,
        });
      }

      const newCount = currentCount - numberOfRooms;

      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              'availability.count': newCount,
              updatedAt: new Date(),
            },
          },
        },
      });
    }

    const result = await Inventory.bulkWrite(bulkOps);

    return res.status(200).json({
      message: 'Room counts reduced successfully for booking',
      result,
    });
  } catch (error: any) {
    console.error('❌ Error reducing rooms after booking confirmed:', error.message || error);
    return res.status(500).json({ message: 'Failed to reduce rooms after booking confirmed' });
  }
};

export const increaseRoomsAfterBookingCancelled = async (
  res: Response,
  hotelCode: string,
  roomTypeCode: string,
  numberOfRooms: number,
  dates: Date[]
) => {
  console.log(`Get data to increase rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

  const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
  const missingFields = Object.entries(requiredFields)
    .filter(
      ([key, value]) =>
        value === undefined ||
        value === null ||
        value === '' ||
        (key === 'dates' && (!Array.isArray(value) || value.length !== 2 || !value.every(d => d instanceof Date && !isNaN(d.getTime()))))
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing or invalid required fields: ${missingFields.join(', ')}`,
    });
  }

  const [checkInDate, checkOutDate] = dates;

  if (checkInDate > checkOutDate) {
    return res.status(400).json({
      message: 'Check-in date must be before or equal to check-out date',
    });
  }

  try {
    const inventoryRecords = await Inventory.find({
      hotelCode,
      invTypeCode: roomTypeCode,
      'availability.startDate': {
        $gte: new Date(checkInDate),
        $lte: new Date(checkOutDate),
      },
    });

    if (!inventoryRecords || inventoryRecords.length === 0) {
      return res.status(404).json({ message: 'No matching room inventory records found for the given dates.' });
    }

    const bulkOps: AnyBulkWriteOperation<IInventory>[] = [];

    for (const item of inventoryRecords) {
      const currentCount = item.availability?.count || 0;
      const newCount = currentCount + numberOfRooms;

      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              'availability.count': newCount,
              updatedAt: new Date(),
            },
          },
        },
      });
    }

    const result = await Inventory.bulkWrite(bulkOps);

    return res.status(200).json({
      message: 'Room counts increased successfully after cancellation.',
      result,
    });
  } catch (error: any) {
    console.error('❌ Error increasing rooms after booking cancellation:', error.message || error);
    return res.status(500).json({ message: 'Failed to increase rooms after booking cancellation' });
  }
};