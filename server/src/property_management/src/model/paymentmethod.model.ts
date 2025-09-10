// import mongoose, { Document, Schema, Types } from 'mongoose';

// import {PropertyInfoType, PropertyInfo} from './property.info.model'

// type PaymentMethodType =
//   | 'cash'
//   | 'upi'
//   | 'visa'
//   | 'mastercard'
//   | 'american_express'
//   | 'diners_club'
//   | 'jcb'
//   | 'maestro'
//   | 'discover'
//   | 'unionpay';


//   interface PaymentMethodDetails {
//     // Define properties for each payment method type
//     cash?: {
//       // Cash-specific properties
//       currency: string;
//     };
//     upi?: {
//       // UPI-specific properties
//       id: string;
//     };
//     visa?: {
//       // Visa-specific properties
//       cardNumber: string;
//       expirationDate: string;
//       cvv: string;
//     };
//     mastercard?: {
//       // Mastercard-specific properties
//       cardNumber: string;
//       expirationDate: string;
//       cvv: string;
//     };
//     // Add properties for other payment methods as needed
//   }

// interface PropertyPaymentMethodType extends Document {
//     type: PaymentMethodType;
//     details: PaymentMethodDetails;


// }

// interface PaymentMethodModel extends Document {
//     propertyInfoId: Types.ObjectId | PropertyInfoType;
//     methods: PropertyPaymentMethodType[];
//   }

//   const paymentMethodSchema = new Schema<PaymentMethodModel>({
//       propertyInfoId: { type: Schema.Types.ObjectId, ref: 'PropertyInfo',required: true },
//     methods: [
//       {
        
//         type: {
//           type: String,
//           enum: [
//             'cash',
//             'upi',
//             'visa',
//             'mastercard',
//             'american_express',
//             'diners_club',
//             'jcb',
//             'maestro',
//             'discover',
//             'unionpay',
//           ],
//           required: true,
//         },
//         details: {
//           type: Schema.Types.Mixed,
//           required: true,
//         },
//       },
//     ],
//   });

//   const PaymentMethod = mongoose.model<PaymentMethodModel>('PaymentMethod', paymentMethodSchema);

//   export { PaymentMethod, PaymentMethodType, PaymentMethodDetails };

