// "use client";

// // Define the interface for formData
// interface FormData {
//   name: string;
//   month: string;
//   year: string;
//   cvc: string;
// }

// // Define the interface for formErrors
// interface FormErrors {
//   name?: string;
//   cardNumber?: string;
//   month?: string;
//   year?: string;
//   cvc?: string;
// }

// // Define the interface for the props
// interface FormProps {
//   formData: FormData;
//   handleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   formattedCardNumber: string;
//   handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
//   formErrors: FormErrors;
// }

// export default function Form({
//   formData,
//   handleInput,
//   formattedCardNumber,
//   handleSubmit,
//   formErrors,
// }: FormProps) {
//   const { name, month, year, cvc } = formData;

//   return (
//     <form
//       aria-label="credit card form"
//       className="form  mt-[91px]  lg:mt-[80px] flex flex-col w-[327px] h-[348px] lg:w-[381px] lg:h-[372px] lg:ml-[349px] lg:mb-[90px]"
//       onSubmit={handleSubmit}
//     >
//       <label htmlFor="name" className="form--name_label">
//         Cardholder Name
//       </label>
//       <input
//         className="form--name_input lg:w-[381px] min-h-[45px]"
//         name="name"
//         value={name}
//         id="name"
//         aria-label="name"
//         onChange={handleInput}
//         placeholder="e.g. HONEY SWAIN"
//       />
//       <div className="form--error text-red-500 mt-2 text-xs leading-3">
//         {formErrors.name}
//       </div>
//       <label
//         htmlFor="cardNumber"
//         className="form--cardNumber_label mt-[18px] lg:mt-[26px]"
//       >
//         Card Number
//       </label>
//       <input
//         className="form--card_number_input lg:w-[381px] min-h-[45px]"
//         name="cardNumber"
//         value={formattedCardNumber}
//         id="cardNumber"
//         aria-label="cardNumber"
//         onChange={handleInput}
//         placeholder="e.g. 1234 5678 9123 0000"
//         maxLength={19}
//       />
//       <div className="form--error text-red-500 mt-2 text-xs leading-3">
//         {formErrors.cardNumber}
//       </div>
//       <div className="form--exp_container flex w-full mt-[14px] mb-[28px] lg:mb-[40px] lg:mt-[26px]">
//         <div className="form--month_container mr-2">
//           <label htmlFor="month" className="form--month_label block mb-[9px]">
//             EXP.DATE
//           </label>
//           <input
//             className="form--month_input w-[72px] lg:w-[80px]"
//             name="month"
//             value={month}
//             id="month"
//             aria-label="month"
//             onChange={handleInput}
//             placeholder="MM"
//             maxLength={2}
//           />
//           <div className="form--error text-red-500 mt-2 text-xs leading-3 w-[84px]">
//             {formErrors.month}
//           </div>
//         </div>

//         <div className="form--month_container mr-[11px] lg:mr-[20px]">
//           <label htmlFor="year" className="form--year_label block mb-[9px]">
//             MM/YY
//           </label>
//           <input
//             className="form--year_input w-[72px] lg:w-[80px]"
//             name="year"
//             value={year}
//             id="year"
//             aria-label="year"
//             onChange={handleInput}
//             placeholder="YY"
//             maxLength={2}
//           />
//           <div className="form--error text-red-500 mt-2 text-xs leading-3">
//             {formErrors.year}
//           </div>
//         </div>
//         <div className="form--cvc_container">
//           <label htmlFor="cvc" className="form--cvc_label block mb-[9px]">
//             CVC
//           </label>
//           <input
//             className="form--cvc_input w-[155px] lg:w-[191px]"
//             name="cvc"
//             value={cvc}
//             id="cvc"
//             aria-label="cvc"
//             onChange={handleInput}
//             placeholder="e.g. 123"
//             maxLength={3}
//           />
//           <div className="form--error text-red-500 mt-2 text-xs leading-3">
//             {formErrors.cvc}
//           </div>
//         </div>
//       </div>
//       <button
//         type="submit"
//         className="form--submit_btn bg-[#21092F] text-white w-[327px] min-h-[53px] rounded-lg lg:w-[381px]"
//         aria-label="confirm button"
//       >
//         Confirm
//       </button>
//     </form>
//   );
// }
