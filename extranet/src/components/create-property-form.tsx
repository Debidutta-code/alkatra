
"use client";

import React, { useState } from "react";
import { BookOpen, DoorOpen, MapPinned, Settings, ShowerHead, DollarSign } from "lucide-react";
import PropertyInfo from "./property/property-info";
import PropertyConfiguration from "./property/property-configuration";
import PropertyAddress from "./property/property-address";
import PropertyAmenities from "./property/property-amenities";
import Rooms from "./property/room";
import RoomAminity from './property/room-amenities';
// import RatePlan from "./property/ratePlan-property";
import { RootState, useSelector } from "../redux/store";

type Props = {};

const steps = [
  {
    id: 1,
    icon: <Settings size={20} />,
    name: "Property Configuration",
    description: "Select PMS, CM, or Internal configuration",
  },
  {
    id: 2,
    icon: <BookOpen size={20} />,
    name: "Property Information",
    description: "General property information",
  },
  {
    id: 3,
    icon: <MapPinned size={20} />,
    name: "Property Address",
    description: "Location of property",
  },
  {
    id: 4,
    icon: <ShowerHead size={20} />,
    name: "Property Amenities",
    description: "Available room types and their facilities",
  },
  {
    id: 5,
    icon: <DoorOpen size={20} />,
    name: "Room",
    description: "Amenities availabilty",
  },
  {
    id: 6,
    icon: <ShowerHead size={20} />,
    name: "Room Amenities",
    description: "Room Amenities availabilty",
  },
];

export default function CreatePropertyForm({ }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [currenStep, setCurrentStep] = useState(0);

  const { properties, draftProperties } = useSelector(
    (state: RootState) => state.propertyReducer
  );

  const next = () => {
    if (currenStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const previous = () => {
    if (currenStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  const renderStepContent = () => {
    let Component: React.ReactNode = <>Not Step</>;
    switch (currenStep) {
      case 0:
        Component = <PropertyConfiguration onNext={next} />;
        break;
      case 1:
        Component = <PropertyInfo onNext={next} />;
        break;
      case 2:
        Component = <PropertyAddress onNext={next} onPrevious={previous} />;
        break;
      case 3:
        Component = <PropertyAmenities onNext={next} onPrevious={previous} />;
        break;
      case 4:
        Component = <Rooms onNext={next} onPrevious={previous} />;
        break
      case 5:
        Component = <RoomAminity onNext={next} onPrevious={previous} />;
        break
      // case 6:
      //   Component = <RatePlan onPrevious={previous} />;
      default:
        break;
    }

    return Component;
  };

  return (
    // <div className="grid place-content-center">
    // <div className="w-max flex justify-center gap-20">
    <div className="w-full flex justify-center h-screen gap-10">
      <CreateFormSteps currentStep={currenStep} step={steps} />
      <div className="w-full sm:w-1/2 ">
        {/* <div className="w-[60%]"> */}
        {renderStepContent()}</div>
    </div>
    /* </div> */
  );
}

function CreateFormSteps({
  step,
  currentStep,
}: {
  step: typeof steps;
  currentStep: number;
}) {
  function checkIfStepIsCompleted(step: number) {
    return (step - 1) > currentStep;
  }

  return (
    <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400 sm:block hidden">
      {step?.map((s) => (
        <li key={s.id} className="mb-10 ms-6">
          <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
            {checkIfStepIsCompleted(s.id as unknown as number) ? (
              s.icon
            ) : (
              <svg
                className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 12"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5.917 5.724 10.5 15 1.5"
                />
              </svg>
            )}
          </span>
          <h3 className="font-medium leading-tight">{s.name}</h3>
          <p className="text-sm">{s.description}</p>
        </li>
      ))}
    </ol>
  );
}
