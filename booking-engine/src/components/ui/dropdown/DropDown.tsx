// "use client";
// import React from "react";
// import {
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
//   Button,
// } from "@nextui-org/react";
// import { ChevronDown } from "lucide-react";

// // Update the type to match the expected type from @nextui-org/react
// type DropdownProps = {
//   dropdownItems: string[];
// };

// // Define Selection type (if needed)
// type Selection = Set<string>;

// export default function DropdownComponents({ dropdownItems }: DropdownProps) {
//   const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
//     new Set([dropdownItems[0]])
//   );

//   const selectedValue = React.useMemo(
//     () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
//     [selectedKeys]
//   );

//   // Update the type of keys to match the expected type
//   const handleSelectionChange = (keys: Selection) => {
//     setSelectedKeys(keys);
//   };

//   return (
//     <Dropdown className="border shadow-xl p-3 bg-white">
//       <DropdownTrigger>
//         <Button
//           variant="bordered"
//           className="capitalize border p-3 ml-2 rounded-lg border-gray-400 w-52  focus:none flex justify-between"
//         >
//           {selectedValue}
//           <span className="ml-2">
//             <ChevronDown />
//           </span>
//         </Button>
//       </DropdownTrigger>
//       <DropdownMenu
//         aria-label="Single selection example"
//         variant="flat"
//         disallowEmptySelection
//         selectionMode="single"
//         selectedKeys={selectedKeys}
//         //onSelectionChange={handleSelectionChange}
//       >
//         {dropdownItems.map((item) => (
//           <DropdownItem className="mb-3 p-2" key={item}>
//             {item}
//           </DropdownItem>
//         ))}
//       </DropdownMenu>
//     </Dropdown>
//   );
// }
