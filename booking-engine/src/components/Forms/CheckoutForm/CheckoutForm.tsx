"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/flight-ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Details from "@/components/Forms/CheckoutForm/Details";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import Extras from "./Extras";
import { useFlightOffersStore } from "@/components/context/flight-offers-provider";
import format from "date-fns/format";
import { useRouter } from "next/navigation";
import { FormState } from "@/store";

type Step = {
  id: number;
  title: string;
};

const steps: Step[] = [
  { id: 1, title: "Your details" },
  { id: 2, title: "Extras" },
  { id: 3, title: "Check and pay" },
];

export default function CheckoutForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>({} as FormState);
  const { selectedFlight } = useFlightOffersStore((state) => state);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check for selected flight on component mount
    if (Object.keys(selectedFlight).length === 0) {
      handleNavigation();
    }
  }, [selectedFlight]);

  const handleNavigation = () => {
    try {
      router.push("/app");
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback for when router is not available
      if (typeof window !== "undefined") {
        window.location.href = "/app";
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      handleNavigation();
    }
  };

  // Don't render anything until we confirm we're on the client side
  if (!isClient) {
    return null;
  }

  // Check for selected flight
  if (Object.keys(selectedFlight).length === 0) {
    return null;
  }

  return (
    <div className="w-full mx-auto p-6 bg-tripswift-off-white">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-tripswift-medium ${
                  step.id === currentStep
                    ? "bg-tripswift-blue text-tripswift-off-white"
                    : step.id < currentStep
                    ? "bg-tripswift-blue text-tripswift-off-white"
                    : "bg-tripswift-black/10 text-tripswift-black/60"
                }`}
              >
                {step.id}
              </div>
              <span className="text-xs mt-1 font-tripswift-medium">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-tripswift-black/10">
          <div
            className="h-1 bg-tripswift-blue transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-tripswift-black/70 font-tripswift-regular">
          Round trip · 1 traveller ·{" "}
          {format(
            new Date(
              selectedFlight?.itineraries?.at(0)?.segments?.at(0)?.departure
                ?.at ?? ""
            ),
            "dd MMM"
          )}{" "}
          -{" "}
          {format(
            new Date(
              selectedFlight?.itineraries?.at(-1)?.segments?.at(-1)?.arrival
                ?.at ?? ""
            ),
            "dd MMM"
          )}
        </p>
        <h1 className="text-2xl font-tripswift-bold text-tripswift-blue">
          {
            selectedFlight?.itineraries.at(0)?.segments?.at(0)?.departure
              ?.iataCode
          }{" "}
          to{" "}
          {
            selectedFlight?.itineraries.at(0)?.segments?.at(-1)?.arrival
              ?.iataCode
          }
        </h1>
      </div>

      <div className="w-full flex flex-col gap-4 md:flex-row justify-between">
        <div className="w-full md:w-[60%]">
          {steps[currentStep - 1].title === "Your details" && (
            <Details form={form} setForm={setForm} />
          )}
          {steps[currentStep - 1].title === "Extras" && (
            <Extras />
          )}
          {/* {steps[currentStep - 1].title === "Check and pay" && (
            <FlightItinerary form={form} setForm={setForm} />
          )} */}
        </div>
        <div className="">
          <Card className="border border-tripswift-black/10 shadow-sm bg-tripswift-off-white">
            <CardContent className="p-6">
              <h3 className="font-tripswift-bold text-tripswift-black mb-4">
                Ticket {selectedFlight.travelerPricings.length} traveller
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between font-tripswift-regular text-tripswift-black/80">
                  <span>Flight fare</span>
                  <span className="font-tripswift-medium">
                    {selectedFlight.price.currency +
                      " " +
                      selectedFlight.price.total}
                  </span>
                </div>
                <div className="flex justify-between font-tripswift-regular text-tripswift-black/80">
                  <span>Taxes and charges</span>
                  <span className="font-tripswift-medium">{selectedFlight.price.currency} 00.00</span>
                </div>
                <div className="border-t border-tripswift-black/10 my-2 pt-2"></div>
                <div className="flex justify-between font-tripswift-bold text-lg text-tripswift-blue">
                  <span>Total</span>
                  <span>
                    {selectedFlight.price.currency +
                      " " +
                      selectedFlight.price.total}
                  </span>
                </div>
                <p className="text-sm text-tripswift-black/60 font-tripswift-regular">
                  Includes taxes and charges
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4 border border-tripswift-black/10 shadow-sm bg-tripswift-off-white">
            <CardContent className="p-6">
              <h3 className="font-tripswift-bold text-tripswift-black mb-2">Give feedback</h3>
              <p className="text-sm text-tripswift-black/60 font-tripswift-regular">
                Tell us how we&apos;re doing and what could be better
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          className="btn-tripswift-secondary transition-colors duration-300"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          className="btn-tripswift-primary transition-colors duration-300 hover:bg-[#054B8F]"
          onClick={() =>
            steps[currentStep - 1].title === "Check and pay"
              ? document.dispatchEvent(new Event("PAY"))
              : handleNext()
          }
        >
          {steps[currentStep - 1].title === "Check and pay" ? (
            <>Pay Now</>
          ) : (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <Button 
          variant="link" 
          className="text-tripswift-blue hover:text-[#054B8F] font-tripswift-medium transition-colors duration-300"
        >
          Give feedback
        </Button>
        <p className="text-xs text-tripswift-black/60 font-tripswift-regular">
          Tell us how we&apos;re doing and what could be better
        </p>
      </div>
    </div>
  );
}