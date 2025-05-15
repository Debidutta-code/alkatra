import React from "react";

// type Props = {};

// export default function ProfileProperty({}: Props) {
//   return <div>ProfileProperty</div>;
// }

import PropertySlide from "../../../../components/property/property-slide";

import axios from "axios";
import { cookies } from "next/headers";

async function fetchProperties(accessToken: string) {
  const { data } = await axios.get("http://localhost:8040/api/v1/property/me", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  const { properties, draftProperties } = data.data;
  // console.log("data: ", data,draftProperties)
  // console.log("properties: ", properties)
  // console.log("draftProperties: ", draftProperties, )
  return { properties, draftProperties };
}

export default async function Property() {
  const cookieStore = cookies();
  const themetoken = cookieStore.get("accessToken");

  console.log("theameToken ", themetoken);

  const { properties, draftProperties } = await fetchProperties(
    themetoken?.value || ""
  );

  return (
    <main className="py-8 px-56">
      <div className="mt-10 flex flex-wrap gap-4">
        <PropertySlide properties={draftProperties} />
      </div>
    </main>
  );
}
