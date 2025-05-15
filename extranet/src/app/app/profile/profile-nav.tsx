"use client";

import Link from "next/link";
import React from "react";
import { Button } from "../../../components/ui/button";
import { LandPlot, MapPinned, User } from "lucide-react";
import { usePathname } from "next/navigation";

type Props = {};

const PROFILE_NAVLINKS = [
  {
    title: "Profile",
    link: "/app/profile",
    icon: <User size={16} />,
  },
  {
    title: "Property",
    link: "/app/profile/property",
    icon: <LandPlot size={16} />,
  },
  {
    title: "Address",
    link: "/app/profile/address",
    icon: <MapPinned size={16} />,
  },
];

export default function ProfileNav({}: Props) {
  const pathname = usePathname();

  const activePath = PROFILE_NAVLINKS.filter(
    (link) => {
      console.log(link.title.toLowerCase() ,  "=== " , pathname.split("/").pop())
      return link.title.toLowerCase() === pathname.split("/").pop()}
  )[0];

  return (
    // <nav className="flex flex-col border-r-2 pr-2 space-y-2">
    <nav className="flex flex-wrap sm:flex-col border-r-2 pr-2 space-y-2">
      {PROFILE_NAVLINKS?.map((link, index) => (
        <Navitem
          key={`${JSON.stringify(link) + index}`}
          activePath={activePath}
          title={link?.title}
          link={link?.link}
          icon={link?.icon}
        />
      ))}
    </nav>
  );
}

function Navitem({
  title,
  link,
  icon,
  activePath,
}: {
  title: string;
  link: string;
  icon: React.ReactNode;
  activePath: {
    title: string;
    link: string;
    icon: React.ReactNode;
  };
}) {
  return (
    <Link href={link} onClick={()=> console.log('title#######' , title)}>
      <Button
        variant={activePath.title === title ? "secondary" : "ghost"}
        className="w-[150px] gap-4 justify-start flex items-center"
        
      >
        {icon} {title}
      </Button>
    </Link>
  );
}
