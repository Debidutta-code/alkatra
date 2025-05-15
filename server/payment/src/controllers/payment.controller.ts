import { NextFunction, Response ,Request} from "express";
// import { instance } from "..";
import { instance } from "../utils/razorpay";
import crypto from "crypto";
import {catchAsync } from "../utils";

const checkout: ReturnType<typeof catchAsync> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    const order = await instance.orders.create(options);

    res.status(201).json({
      status: "success",
      error: false,
      message: "Payment created successfully",
      data: {
        order,
      },
    });
  }
);

const verifyPayment: ReturnType<typeof catchAsync> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const signatureIsValid = generated_signature === razorpay_signature;

    if (signatureIsValid) {
      // res.redirect(
      //   `http://localhost:3000/payment/success?reference=${razorpay_payment_id}`
      // );
      res.status(201).json({
        status: "success",
        error: false,
        message: "Payment conform.",
        data: {
          
        },
      });
    }

  }
);

export { checkout, verifyPayment };
