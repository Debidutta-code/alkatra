import { NextFunction, Response } from "express";
import { catchAsync, Request } from "../utils/catchAsync";
import { DataSourceProvider } from "../model/dataSourceProvider.model";

export const getDataSourceProviders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.query;

    let filter: any = {};
    if (type && ['PMS', 'CM', 'Internal'].includes(type as string)) {
      filter.type = type;
    }

    const providers = await DataSourceProvider.find(filter).sort({ name: 1 });

    res.status(200).json({
      status: "success",
      error: false,
      message: "Data source providers retrieved successfully",
      data: providers,
    });
  }
);

export const getDataSourceTypes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      error: false,
      message: "Data source types retrieved successfully",
      data: ['PMS', 'CM', 'Internal'],
    });
  }
);