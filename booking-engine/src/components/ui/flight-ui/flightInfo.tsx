"use client";
import flightImg from "@/components/assets/flight.png";
import Image from "next/image";

type FlightInfoProps = {
  time: string;
  date: string;
  airport: string;
  duration?: string;
  isArrival?: boolean;
  airline?: string;
};
export default function FlightInfo({
  time,
  date,
  airport,
  duration,
  isArrival = false,
  airline,
}: FlightInfoProps) {
  return (
    <div className="flex items-start gap-5">
      {!isArrival && (
        <div className="h-max flex items-center justify-center">
          <Image src={flightImg} alt="flight img" width={80} />
        </div>
      )}
      <div className="flex flex-col items-start">
        {/* {duration && (
          <div className="text-sm text-muted-foreground">{duration}</div>
        )} */}
        <div className="text-2xl font-semibold">{time}</div>
        {/* <div className="text-sm text-muted-foreground">{date}</div> */}
        <div className="text-sm text-muted-foreground">
          {airport + " . " + date}
        </div>
      </div>
    </div>
  );
}
