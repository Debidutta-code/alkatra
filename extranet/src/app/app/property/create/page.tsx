import React from "react";
import CreatePropertyForm from "../../../../components/create-property-form";
import Breadcrumbs from "../../../../components/ui/breadcrumbs";

type Props = {};

export default function CreateProperty({}: Props) {
  return (
    // <main className="py-8 px-56">
    <main className="py-4 px-4 md:px-8 lg:px-16 xl:px-24">

      <div className="flex items-center justify-between">
        <Breadcrumbs />
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <CreatePropertyForm />
      </div>
    </main>
  );
}
