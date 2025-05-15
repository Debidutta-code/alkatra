// import React from "react";
// import Breadcrumbs from "../../../components/ui/breadcrumbs";
// import PropertySlide from "../../../components/property/property-slide";
// import { Button } from "../../../components/ui/button";
// import { Plus } from "lucide-react";
// import Link from "next/link";
// import { RootState, store, useSelector } from "../../../redux/store";
// import axios from "axios";
// import { cookies } from 'next/headers'

// type Props = {
//   searchParams: {
//     token: string;
//   };
// };
// // interface DraftProperty {
// //   _id: string;
// //   property_name: string;
// // }

// async function fetchProperties(accessToken: string) {
//   const { data } = await axios.get("http://localhost:8040/api/v1/property/me", {
//     headers: {
//       Authorization: "Bearer " + accessToken,
//     },
//   });

//   const { properties, draftProperties } = data.data;
//   // console.log("data: ", data,draftProperties)
//   // console.log("properties: ", properties)
//   // console.log("draftProperties: ", draftProperties, )
//   return { properties, draftProperties };
// }



// export default async function Property({ searchParams }: Props) {
//   //  const accessToken = searchParams.token;
//     // const { properties } = await fetchProperties(accessToken);
//   const cookieStore = cookies()
//   const themetoken = cookieStore.get('accessToken')


//   console.log("theameToken ",themetoken)

 
//    const { properties ,draftProperties} = await fetchProperties(themetoken?.value || "");

//   return (
//     <main className="py-8 px-56">
//       <div className="flex items-center justify-between">
//         <Breadcrumbs />
//         <Link href={"/app/property/create"}>
//           <Button variant={"outline"}>
//             <Plus size={16} strokeWidth={2.5} className="mr-2" />
//             Create
//           </Button>
//         </Link>
//       </div>
//       <div className="mt-10 flex flex-wrap gap-4">
//         <PropertySlide properties={draftProperties} />
//       </div>
//     </main>
//   );
// }



import React from 'react'
import Property from '../../../components/property/Property'

const page = () => {
  return (
    <>
      <Property searchParams={{
        token: ''
      }}/>
    </>
  )
}

export default page