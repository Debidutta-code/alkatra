import { Request, Response, NextFunction } from 'express';
import { PaymentMethod, PaymentMethodType } from '../../model/paymentmethod.model';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/appError';

const createPaymentMethod = catchAsync(
    async (req: Request, res: Response, next: NextFunction) =>{
        const {propertyInfoId, methods } = req.body;

        if (!methods || !Array.isArray(methods) || methods.length === 0) {
            return next(new AppError('Please provide at least one payment method', 400));
          }

          const newPaymentMethods = await PaymentMethod.create({propertyInfoId, methods });
          const totalPaymentMethods = await PaymentMethod.find();

          res.status(201).json({
            status: 'success',
            error: false,
            total_payment_methods: totalPaymentMethods.length,
            message: 'Payment methods registered successfully',
            data: newPaymentMethods,
          });

    }
);

const updatePaymentMethod = catchAsync(
  async (req: Request, res: Response, next:NextFunction) =>{
    const paymentMethodId = req.params.id;

    const {propertyInfoId, methods } = req.body;

    const paymentMethod = await PaymentMethod.findById(paymentMethodId);

    if (!paymentMethod) {
      return next(new AppError(`No property found with this id ${paymentMethodId}`, 404));
    }

    const updatePaymentMethod = await PaymentMethod.findByIdAndUpdate(
      paymentMethodId,
      {propertyInfoId, methods},
      {new: true}
  );
  return res.status(200).json({
      status: "success",
      error: false,
      message: "payment method  updated successfully",
      data: updatePaymentMethod,
    });

  }

);

const getAllPaymentMethodByPropertyId = catchAsync(
  async (req:Request, res: Response, next: NextFunction) =>{

    const propertyInfoId = req.params.id;

    const paymentMethods = await PaymentMethod.find({propertyInfoId:propertyInfoId});
    
        if (!paymentMethods) {
          return next(new AppError(`No property found with this id ${propertyInfoId}`, 404));
        }

        res.status(200).json({
          status: "success",
          error: false,
          message: "paymentMethods fetched successfully",
          data: paymentMethods,
        });

  }
)
export  {createPaymentMethod,updatePaymentMethod,getAllPaymentMethodByPropertyId};

