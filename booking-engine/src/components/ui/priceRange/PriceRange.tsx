import React from "react";
import { Slider } from "@nextui-org/react";

export default function PriceRange() {
  return (
    <Slider
      label="Price Range"
      step={50}
      minValue={0}
      maxValue={1000}
      defaultValue={[100, 500]}
      formatOptions={{ style: "currency", currency: "INR" }}
      className="max-w-md "
    />
  );
}
