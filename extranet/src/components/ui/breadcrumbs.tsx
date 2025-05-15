"use client";

import React, { useEffect } from "react";
import {
  Breadcrumbs as NextUIBreadcrumbs,
  BreadcrumbItem as NextUIBreadcrumbsItem,
} from "@nextui-org/react";
import { Coins, Home, LandPlot, MapPinned, PenLine, User } from "lucide-react";
import { usePathname } from "next/navigation";

type Props = {};

const SEGMENT_TYPES = [
  {
    name: "property",
    link: "/app/property",
    icon: <LandPlot size={16} />,
  },

  {
    name: "rate-plan",
    link: "/app/rate-plan",
    icon: <Coins size={16} />,
  },

  {
    name: "create",
    link: "/app/property/create",
    icon: <PenLine size={16} />,
  },
  {
    name: "profile",
    link: "/app/profile",
    icon: <User size={16} />,
  },
  {
    name: "address",
    link: "/app/profile/address",
    icon: <MapPinned size={16} />,
  },
];

export default function Breadcrumbs({}: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment !== "");

  const filteredSegments = segments.filter((path) =>
    SEGMENT_TYPES.some((type) => type.name === path)
  );

  useEffect(() => {
    const filteredSegments = segments.filter((path) =>
      SEGMENT_TYPES.some((type) => type.name === path)
    );

    const links = filteredSegments.map((segment) => {
      const links = SEGMENT_TYPES.find((type) => type.name === segment)?.link;
      return links;
    });

    // console.log(links);
  }, [pathname]);

  function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return (
    <NextUIBreadcrumbs>
      <NextUIBreadcrumbsItem
       href={'/'}
       startContent={<Home size={16} />}>
        Home
      </NextUIBreadcrumbsItem>
      {filteredSegments.map((segment, index) => {
        return (
          <NextUIBreadcrumbsItem
            key={`${JSON.stringify(segment) + index}`}
            href={SEGMENT_TYPES.find((type) => type.name === segment)?.link}
            startContent={
              SEGMENT_TYPES.find((type) => type.name === segment)?.icon
            }
          >
            {capitalize(segment)}
          </NextUIBreadcrumbsItem>
        );
      })}
    </NextUIBreadcrumbs>
  );
}
