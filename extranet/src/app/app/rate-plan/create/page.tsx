import React from "react";
//import CreatePropertyForm from "../../../../components/create-property-form";
import Breadcrumbs from "../../../../components/ui/breadcrumbs";
// import RatePlanForm from "../../../../components/ratePlan/ratePlan-form";

type Props = {};

export default function CreateProperty({}: Props) {
  return (
    <main className="py-8 px-56py-8 px-4 md:px-8 lg:px-16 xl:px-24">
      <div className="flex items-center justify-between">
        <Breadcrumbs />
      </div>
      <div className="mt-10 flex flex-wrap gap-4 justify-center ">
        {/* <RatePlanForm /> */}
      </div>
    </main>
  );
}