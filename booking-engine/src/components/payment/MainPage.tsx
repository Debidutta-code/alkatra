"use client";

import { useState, useEffect } from "react";
import Head from "./Head";
import Form from "./Form";
import FormThankYou from "./FormThankyou";

// Define the structure for form data and errors
interface FormValues {
  cardNumber: string;
  month: string;
  year: string;
  cvc: string;
  name: string;
}

function MainPage() {
  // State for form data
  const [formData, setFormData] = useState<FormValues>({
    cardNumber: "",
    month: "",
    year: "",
    cvc: "",
    name: "",
  });

  // State for form errors
  const [formErrors, setFormErrors] = useState<Partial<FormValues>>({});

  // State for formatted card number
  const [formattedCardNumber, setFormattedCardNumber] = useState("");

  // State to track if form is submitted
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Format card number with spaces
  useEffect(() => {
    setFormattedCardNumber(
      formData.cardNumber
        .replace(/\s?/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
    );
  }, [formData.cardNumber]);

  // Check if string contains only numbers
  function containsOnlyNumbers(str: string): boolean {
    return /^\d+$/.test(str.replace(/\s/g, ""));
  }

  // Validate form values
  const validate = (values: FormValues): Partial<FormValues> => {
    const errors: Partial<FormValues> = {};
    const currentYear = new Date().getFullYear();
    const lastTwoDigitsOfYear = currentYear.toString().slice(-2);

    if (!values.name) {
      errors.name = "Name can't be blank";
    }

    if (!values.cardNumber) {
      errors.cardNumber = "Card number can't be blank";
    } else if (!containsOnlyNumbers(values.cardNumber)) {
      errors.cardNumber = "Wrong format, numbers only";
    } else if (values.cardNumber.replace(/\s/g, "").length !== 16) {
      errors.cardNumber = "Card number length must be 16";
    }

    if (!values.month) {
      errors.month = "Can't be blank";
    } else if (!containsOnlyNumbers(values.month)) {
      errors.month = "Wrong format, numbers only";
    } else if (parseInt(values.month) > 12 || parseInt(values.month) < 1) {
      // errors.month = "Must be between 1 and 12";
    }

    if (!values.year) {
      errors.year = "Can't be blank";
    } else if (!containsOnlyNumbers(values.year)) {
      errors.year = "Wrong format, numbers only";
    } else if (parseInt(values.year) < parseInt(lastTwoDigitsOfYear)) {
      errors.year = "Year can't be less than current year";
    }

    if (!values.cvc) {
      errors.cvc = "Can't be blank";
    } else if (!containsOnlyNumbers(values.cvc)) {
      errors.cvc = "Wrong format, numbers only";
    } else if (values.cvc.length !== 3) {
      errors.cvc = "CVC must be 3 digits";
    }

    return errors;
  };

  // Check if there are no errors
  const noErrors = Object.keys(formErrors).length === 0;

  // Handle input changes
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setFormErrors(validationErrors);
    setFormSubmitted(true);
  };

  return (
    <div className="App h-full w-full flex flex-col items-center lg:flex-row">
      <Head formattedCardNumber={formattedCardNumber} formData={formData} />
      {!noErrors || !formSubmitted ? (
        <Form
        handleSubmit={handleSubmit}
        formattedCardNumber={formattedCardNumber}
        formData={formData}
        handleInput={handleInput}
        formErrors={formErrors}
      />
      ) : (
        <FormThankYou />
      )}
    </div>
  );
}

export default MainPage;