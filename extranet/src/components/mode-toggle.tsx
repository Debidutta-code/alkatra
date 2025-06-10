// "use client";

// import * as React from "react";
// import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
// import { useTheme } from "next-themes";

// import { Button } from "./ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";

// export function ModeToggle() {
//   const { resolvedTheme, setTheme } = useTheme();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="icon">
//           <div className="relative flex items-center justify-center w-6 h-6">
//             <SunIcon
//               className={`h-[1.2rem] w-[1.2rem] transition-all ${
//                 resolvedTheme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
//               }`}
//             />
//             <MoonIcon
//               className={`h-[1.2rem] w-[1.2rem] absolute transition-all ${
//                 resolvedTheme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
//               }`}
//             />
//           </div>
//           <span className="sr-only">Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    setTheme("light");
  }, []);

  return (
    <Button
      className="bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-900"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <div className="relative flex items-center justify-center w-6 h-6">
        <SunIcon
          className={`h-[1.2rem] w-[1.2rem] transition-all text-tripswift-blue dark:text-tripswift-off-white ${
            resolvedTheme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`}
        />
        <MoonIcon
          className={`h-[1.2rem] w-[1.2rem] absolute transition-all text-tripswift-blue dark:text-tripswift-off-white ${
            resolvedTheme === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}